import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

const allowedTagPattern = /^[a-z0-9:_-]+$/i
const allowedSlugPattern = /^[a-z0-9-]+$/i

interface RevalidateRequest {
  type?: string
  slug?: string
  tags?: string[]
  paths?: string[]
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expectedToken = process.env.REVALIDATE_SECRET

  if (!expectedToken) {
    return NextResponse.json({ error: "REVALIDATE_SECRET is not configured" }, { status: 500 })
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: RevalidateRequest
  try {
    payload = (await request.json()) as RevalidateRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const tags = normalizeTags(payload)
  const paths = normalizePaths(payload)

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json({ error: "At least one tag or path is required" }, { status: 400 })
  }

  for (const tag of tags) {
    revalidateTag(tag, "max")
  }
  for (const path of paths) {
    revalidatePath(path)
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
    now: new Date().toISOString(),
  })
}

function normalizeTags(payload: RevalidateRequest): string[] {
  const tags = new Set<string>()
  for (const tag of payload.tags ?? []) {
    if (typeof tag === "string" && allowedTagPattern.test(tag)) {
      tags.add(tag)
    }
  }

  const safeSlug = getSafeSlug(payload.slug)
  if (payload.type === "post" && safeSlug) {
    tags.add("posts")
    tags.add(`post:${safeSlug}`)
    tags.add("sitemap")
    tags.add("llms")
    tags.add("rss")
  }
  if (payload.type === "home") {
    tags.add("site")
    tags.add("home")
    tags.add("llms")
    tags.add("rss")
  }
  if (payload.type === "profile" || payload.type === "site") {
    tags.add("site")
    tags.add("profile")
    tags.add("llms")
    tags.add("rss")
  }
  if (payload.type === "introduction") {
    tags.add("site")
    tags.add("introduction")
    tags.add("llms")
  }
  if (payload.type === "project") {
    tags.add("projects")
    tags.add("sitemap")
    tags.add("llms")
  }
  if (payload.type === "note") {
    tags.add("notes")
    if (safeSlug) {
      tags.add(`note:${safeSlug}`)
    }
    tags.add("sitemap")
    tags.add("llms")
    tags.add("rss")
  }
  if (payload.type === "workbench") {
    tags.add("workbench")
    tags.add("llms")
  }
  if (payload.type === "sitemap") {
    tags.add("sitemap")
  }
  if (payload.type === "content") {
    for (const tag of ["site", "home", "profile", "introduction", "posts", "notes", "projects", "workbench", "sitemap", "llms", "rss"]) {
      tags.add(tag)
    }
  }

  return Array.from(tags)
}

function normalizePaths(payload: RevalidateRequest): string[] {
  const paths = new Set<string>()
  for (const path of payload.paths ?? []) {
    if (isValidPath(path)) {
      paths.add(path)
    }
  }

  const safeSlug = getSafeSlug(payload.slug)
  if (payload.type === "post" && safeSlug) {
    paths.add("/blog")
    paths.add(`/blog/${safeSlug}`)
    paths.add(`/blog/${safeSlug}.md`)
    paths.add("/rss.xml")
    paths.add("/sitemap.xml")
    paths.add("/llms.txt")
    paths.add("/llms-full.txt")
  }
  if (payload.type === "home") {
    paths.add("/")
    paths.add("/rss.xml")
    paths.add("/notes/rss.xml")
    paths.add("/llms.txt")
    paths.add("/llms-full.txt")
  }
  if (payload.type === "profile" || payload.type === "site") {
    paths.add("/")
    paths.add("/rss.xml")
    paths.add("/notes/rss.xml")
    paths.add("/llms.txt")
    paths.add("/llms-full.txt")
  }
  if (payload.type === "introduction") {
    paths.add("/introduction")
    paths.add("/llms.txt")
    paths.add("/llms-full.txt")
  }
  if (payload.type === "project") {
    paths.add("/projects")
    paths.add("/sitemap.xml")
    paths.add("/llms.txt")
    paths.add("/llms-full.txt")
  }
  if (payload.type === "note") {
    paths.add("/notes")
    paths.add("/notes/rss.xml")
    paths.add("/sitemap.xml")
    paths.add("/llms.txt")
    paths.add("/llms-full.txt")
  }
  if (payload.type === "workbench") {
    paths.add("/workbench")
    paths.add("/llms.txt")
    paths.add("/llms-full.txt")
  }
  if (payload.type === "sitemap") {
    paths.add("/sitemap.xml")
  }
  if (payload.type === "content") {
    for (const path of ["/", "/blog", "/notes", "/projects", "/workbench", "/introduction", "/rss.xml", "/notes/rss.xml", "/sitemap.xml", "/llms.txt", "/llms-full.txt"]) {
      paths.add(path)
    }
  }

  return Array.from(paths)
}

function isValidPath(path: unknown): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
}

function getSafeSlug(slug: unknown): string | undefined {
  if (typeof slug !== "string" || !allowedSlugPattern.test(slug)) {
    return undefined
  }
  return slug
}
