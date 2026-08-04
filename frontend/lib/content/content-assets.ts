import { promises as fs } from "node:fs"
import path from "node:path"
import { getContentRoot } from "./content-root"

export async function getContentAssetResponse(
  collection: "posts" | "notes",
  slug: string,
  assetPath: string[],
): Promise<Response | undefined> {
  const safeSlug = sanitizeSegment(slug)
  const safeAssetPath = assetPath.map(sanitizeSegment)
  if (!safeSlug || safeAssetPath.some((segment) => !segment)) {
    return undefined
  }

  const collectionRoot = path.join(getContentRoot(), collection)
  const candidates = [
    path.join(collectionRoot, safeSlug, ...safeAssetPath),
    path.join(collectionRoot, ...safeAssetPath),
  ]

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    if (!resolved.startsWith(`${collectionRoot}${path.sep}`)) {
      continue
    }

    try {
      const file = await fs.readFile(resolved)
      return new Response(new Uint8Array(file), {
        headers: {
          "content-type": getContentType(resolved),
          "cache-control": "public, max-age=300, stale-while-revalidate=86400",
        },
      })
    } catch {
      // Try the collection-level fallback path.
    }
  }

  return undefined
}

function sanitizeSegment(value: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(value) || value === "." || value === "..") {
    return ""
  }

  return value
}

function getContentType(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case ".avif":
      return "image/avif"
    case ".gif":
      return "image/gif"
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".svg":
      return "image/svg+xml"
    case ".webp":
      return "image/webp"
    default:
      return "application/octet-stream"
  }
}
