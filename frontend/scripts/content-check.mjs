import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

const root = process.cwd()
const contentRoot = path.resolve(process.env.CONTENT_ROOT ?? path.join(root, "content-demo"))
const contentEnvironment = normalizeContentEnvironment(process.env.CONTENT_ENV ?? (process.env.NODE_ENV === "production" ? "prod" : "dev"))
const publicRoot = path.resolve(process.env.PUBLIC_ROOT ?? path.join(root, "public"))
const allowedRemoteHosts = new Set(
  parseImageHosts(process.env.IMAGE_ALLOWED_HOSTS ?? process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS ?? ""),
)

const issues = []
const slugsByCollection = new Map()

for (const collection of ["posts", "notes"]) {
  await checkMarkdownCollection(collection)
}

await checkStructuredContentFiles()

await checkGeneratedArtifactsUseDomainLayer()

if (issues.length > 0) {
  console.error(`content:check failed with ${issues.length} issue(s):`)
  for (const issue of issues) {
    console.error(`- ${issue}`)
  }
  process.exit(1)
}

console.log("content:check passed")

async function checkMarkdownCollection(collection) {
  const directory = path.join(contentRoot, collection)
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name)

  for (const fileName of files) {
    const filePath = path.join(directory, fileName)
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = matter(raw)
    const slug = parsed.data.slug ?? fileName.replace(/\.md$/, "")
    const content = parsed.content

    checkFrontmatter(normalizeFrontmatterDates(parsed.data), filePath, collection)
    checkDuplicateSlug(slug, filePath, collection)
    checkDuplicateHeadings(content, filePath)
    await checkImages(content, filePath, collection, slug)
  }
}

function normalizeFrontmatterDates(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value
  }

  const frontmatter = { ...value }
  for (const field of ["date", "updatedAt"]) {
    if (frontmatter[field] instanceof Date) {
      frontmatter[field] = frontmatter[field].toISOString().slice(0, 10)
    }
  }
  return frontmatter
}

function checkFrontmatter(frontmatter, filePath, collection) {
  const requiredFields = collection === "posts"
    ? ["id", "slug", "title", "excerpt", "date", "readTime", "category", "tags", "author", "featured", "color"]
    : ["id", "title", "excerpt", "date", "category", "tags"]

  for (const field of requiredFields) {
    if (frontmatter[field] === undefined || frontmatter[field] === null || frontmatter[field] === "") {
      issues.push(`${relative(filePath)} is missing required frontmatter field "${field}"`)
    }
  }

  if (frontmatter.tags !== undefined && !Array.isArray(frontmatter.tags)) {
    issues.push(`${relative(filePath)} frontmatter field "tags" must be an array`)
  }
  if (collection === "posts" && frontmatter.author !== undefined && typeof frontmatter.author !== "object") {
    issues.push(`${relative(filePath)} frontmatter field "author" must be an object`)
  }
}

function checkDuplicateSlug(slug, filePath, collection) {
  if (typeof slug !== "string" || !slug.trim()) {
    return
  }

  const seen = slugsByCollection.get(collection) ?? new Map()
  if (seen.has(slug)) {
    issues.push(`${relative(filePath)} duplicates slug "${slug}" from ${relative(seen.get(slug))}`)
  }
  seen.set(slug, filePath)
  slugsByCollection.set(collection, seen)
}

async function checkStructuredContentFiles() {
  const files = [
    "site/profile.json",
    "site/profile.en.json",
    "site/home.json",
    "site/home.en.json",
    "site/introduction.json",
    "site/introduction.en.json",
    "site/navigation.json",
    "projects/projects.json",
    "workbench/items.json",
    "workbench/activity.json",
  ]

  for (const file of files) {
    const filePath = await resolveStructuredContentPath(file)
    try {
      JSON.parse(await fs.readFile(filePath, "utf8"))
    } catch (error) {
      issues.push(`${relative(filePath)} is not valid JSON: ${error instanceof Error ? error.message : "unknown error"}`)
    }
  }
}

async function resolveStructuredContentPath(relativePath) {
  const extension = path.extname(relativePath)
  const environmentPath = `${relativePath.slice(0, -extension.length)}.${contentEnvironment}${extension}`
  const environmentFilePath = path.join(contentRoot, environmentPath)

  try {
    await fs.access(environmentFilePath)
    return environmentFilePath
  } catch (error) {
    if (error?.code === "ENOENT" && contentEnvironment !== "prod") {
      return path.join(contentRoot, relativePath)
    }
    if (error?.code === "ENOENT") {
      issues.push(`${relative(environmentFilePath)} is missing production content config`)
      return environmentFilePath
    }
    throw error
  }
}

function normalizeContentEnvironment(value) {
  const environment = value === "production" ? "prod" : value === "development" ? "dev" : value
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(environment)) {
    throw new Error(`Invalid CONTENT_ENV: ${value}`)
  }
  return environment
}

function parseImageHosts(value) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((host) => normalizeImageHost(host))
        .filter(Boolean),
    ),
  )
}

function normalizeImageHost(value) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname.toLowerCase()
  } catch {
    return null
  }
}

function checkDuplicateHeadings(content, filePath) {
  const seen = new Set()
  let inFence = false

  for (const line of content.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) {
      continue
    }

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) {
      continue
    }

    const id = slugify(stripInlineMarkdown(match[2]))
    if (!id) {
      continue
    }
    if (seen.has(id)) {
      issues.push(`${relative(filePath)} has duplicate heading id "${id}"`)
    }
    seen.add(id)
  }
}

async function checkImages(content, filePath, collection, slug) {
  const markdownImagePattern = /!\[([^\]]*)]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g
  const htmlImagePattern = /<img\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)')[^>]*>/gi

  for (const match of content.matchAll(markdownImagePattern)) {
    const alt = match[1].trim()
    const src = match[2]
    const allowMissing = /allow-missing/i.test(match[0])
    if (!alt) {
      issues.push(`${relative(filePath)} image "${src}" is missing alt text`)
    }
    await checkImageSource(src, filePath, collection, slug, allowMissing)
  }

  for (const match of content.matchAll(htmlImagePattern)) {
    const full = match[0]
    const src = match[1] || match[2]
    if (!/\balt=(?:"[^"]+"|'[^']+')/i.test(full)) {
      issues.push(`${relative(filePath)} HTML image "${src}" is missing alt text`)
    }
    await checkImageSource(src, filePath, collection, slug, /allow-missing/i.test(full))
  }
}

async function checkImageSource(src, filePath, collection, slug, allowMissing = false) {
  if (src.startsWith("data:image/")) {
    return
  }

  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(src)) {
    const host = new URL(src).hostname
    if (!allowedRemoteHosts.has(host)) {
      issues.push(`${relative(filePath)} remote image host "${host}" is not allowed`)
    }
    return
  }

  const candidates = src.startsWith("/")
    ? [path.join(publicRoot, src)]
    : [
        path.join(contentRoot, collection, slug, src.replace(/^\.\//, "")),
        path.join(path.dirname(filePath), src),
      ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return
    } catch {
      // Try next candidate.
    }
  }

  if (!allowMissing) {
    issues.push(`${relative(filePath)} image "${src}" does not exist`)
  }
}

async function checkGeneratedArtifactsUseDomainLayer() {
  const sitemap = await fs.readFile(path.join(root, "app", "sitemap.ts"), "utf8")
  const llms = await fs.readFile(path.join(root, "lib", "llms.ts"), "utf8")
  if (!sitemap.includes("listPosts()")) {
    issues.push("app/sitemap.ts must use listPosts() so draft posts stay excluded")
  }
  if (!llms.includes("listPosts()") || !llms.includes("listNotes()")) {
    issues.push("lib/llms.ts must use listPosts()/listNotes() so drafts stay excluded")
  }
}

function stripInlineMarkdown(value) {
  return value
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function relative(filePath) {
  return path.relative(contentRoot, filePath) || "."
}
