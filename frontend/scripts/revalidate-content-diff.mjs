import { execFile } from "node:child_process"
import { promises as fs } from "node:fs"
import path from "node:path"
import { promisify } from "node:util"
import matter from "gray-matter"

const execFileAsync = promisify(execFile)
const contentRoot = path.resolve(process.env.CONTENT_ROOT ?? process.cwd())
const baseRef = requiredEnv("CONTENT_GIT_BASE")
const headRef = process.env.CONTENT_GIT_HEAD ?? "HEAD"
const revalidateUrl = requiredEnv("CONTENT_REVALIDATE_URL")
const token = process.env.CONTENT_REVALIDATE_SECRET ?? requiredEnv("REVALIDATE_SECRET")

const changes = await readChanges().catch((error) => {
  if (/bad object|unknown revision|ambiguous argument/i.test(String(error))) {
    return []
  }
  throw error
})
const invalidations = await collectInvalidations(changes)

for (const invalidation of invalidations) {
  const response = await fetch(revalidateUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(invalidation),
  })

  if (!response.ok) {
    throw new Error(`Revalidation failed for ${JSON.stringify(invalidation)}: ${response.status} ${await response.text()}`)
  }
}

console.log(`Revalidated ${invalidations.length} content scope(s).`)

async function readChanges() {
  const { stdout } = await execFileAsync("git", ["diff", "--name-status", "-z", baseRef, headRef], {
    cwd: contentRoot,
    maxBuffer: 10 * 1024 * 1024,
  })
  const fields = stdout.split("\0").filter(Boolean)
  const changes = []

  for (let index = 0; index < fields.length; index += 2) {
    const status = fields[index]
    if (!status) continue

    if (status.startsWith("R") || status.startsWith("C")) {
      changes.push({ status, paths: [fields[index + 1], fields[index + 2]] })
      index += 1
      continue
    }

    changes.push({ status, paths: [fields[index + 1]] })
  }

  return changes
}

async function collectInvalidations(changes) {
  const invalidations = new Map()
  let needsFallback = false

  for (const change of changes) {
    for (const [index, relativePath] of change.paths.entries()) {
      const refs = refsForChange(change.status, index, relativePath)
      for (const ref of refs) {
        const invalidation = await classifyPath(relativePath, ref)
        if (!invalidation) {
          needsFallback = true
          continue
        }
        invalidations.set(JSON.stringify(invalidation), invalidation)
      }
    }
  }

  if (needsFallback || invalidations.size === 0) {
    invalidations.set(JSON.stringify({ type: "content" }), { type: "content" })
  }

  return [...invalidations.values()]
}

function refsForChange(status, pathIndex, relativePath) {
  if (status.startsWith("D")) return [baseRef]
  if (status.startsWith("R") || status.startsWith("C")) return [pathIndex === 0 ? baseRef : headRef]
  if (status.startsWith("M") && relativePath.endsWith(".md")) return [baseRef, headRef]
  return [headRef]
}

async function classifyPath(relativePath, ref) {
  const normalized = relativePath.replaceAll("\\", "/")
  if (normalized.startsWith("posts/")) {
    return postOrNoteInvalidation("post", normalized, ref)
  }
  if (normalized.startsWith("notes/")) {
    return postOrNoteInvalidation("note", normalized, ref)
  }
  if (normalized === "site/home.json" || normalized === "site/home.en.json") return { type: "home" }
  if (normalized === "site/profile.json" || normalized === "site/profile.en.json" || normalized === "site/navigation.json") return { type: "profile" }
  if (normalized === "site/introduction.json" || normalized === "site/introduction.en.json") return { type: "introduction" }
  if (normalized === "projects/projects.json") return { type: "project" }
  if (normalized.startsWith("workbench/")) return { type: "workbench" }
  return undefined
}

async function postOrNoteInvalidation(type, relativePath, ref) {
  if (relativePath.endsWith(".md")) {
    const slug = await readSlug(relativePath, ref)
    return slug ? { type, slug } : { type: "content" }
  }

  const [, slug] = relativePath.split("/")
  return slug ? { type, slug } : { type: "content" }
}

async function readSlug(relativePath, ref) {
  try {
    const raw = ref === headRef
      ? await fs.readFile(path.join(contentRoot, relativePath), "utf8")
      : (await execFileAsync("git", ["show", `${ref}:${relativePath}`], { cwd: contentRoot })).stdout
    const parsed = matter(raw)
    return typeof parsed.data.slug === "string" && parsed.data.slug ? parsed.data.slug : path.basename(relativePath, ".md")
  } catch {
    return path.basename(relativePath, ".md")
  }
}

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}
