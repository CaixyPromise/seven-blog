import { getSiteUrl } from "@/lib/site-url"

type ArticleCollection = "posts" | "notes"

const DEFAULT_THUMBNAIL = "/brand-mark.png"

export function getArticleThumbnailUrl(
  thumbnail: string | undefined,
  collection: ArticleCollection,
  slug: string,
): string {
  const baseUrl = getSiteUrl()
  const source = thumbnail?.trim()

  if (!source) {
    return new URL(DEFAULT_THUMBNAIL, baseUrl).toString()
  }

  if (/^https:\/\//i.test(source) || source.startsWith("//")) {
    return new URL(source, baseUrl).toString()
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(source)) {
    return new URL(DEFAULT_THUMBNAIL, baseUrl).toString()
  }

  if (source.startsWith("/")) {
    return new URL(source, baseUrl).toString()
  }

  const segments = source.replace(/^\.\//, "").split("/")
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return new URL(DEFAULT_THUMBNAIL, baseUrl).toString()
  }

  const assetPath = segments.map(encodeURIComponent).join("/")
  const assetUrl = `/content-assets/${collection}/${encodeURIComponent(slug)}/${assetPath}`
  return new URL(assetUrl, baseUrl).toString()
}
