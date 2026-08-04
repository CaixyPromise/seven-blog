import { NextResponse } from "next/server"
import type { BlogPost, Note, ProfileContent } from "@/lib/content/types"

type FeedItem = BlogPost | Note

interface GenerateRssFeedOptions {
  profile: ProfileContent
  items: FeedItem[]
  baseUrl: string
  feedPath: string
  sectionPath: string
  itemPathPrefix: string
  titleSuffix: string
  description: string
}

export function generateRssFeed({
  profile,
  items,
  baseUrl,
  feedPath,
  sectionPath,
  itemPathPrefix,
  titleSuffix,
  description,
}: GenerateRssFeedOptions) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "")
  const siteTitle = formatFeedTitle(profile.siteName || profile.brandName, titleSuffix)
  const selfUrl = `${normalizedBaseUrl}${feedPath}`
  const siteUrl = `${normalizedBaseUrl}${sectionPath}`
  const lastBuildDate = getLatestBuildDate(items)

  const itemXml = items
    .filter((item) => item.slug)
    .map((item) => {
      const itemUrl = `${normalizedBaseUrl}${itemPathPrefix}/${item.slug}`
      const categories = [item.category, ...item.tags]
        .filter(Boolean)
        .map((category) => `      <category>${escapeXml(category)}</category>`)
        .join("\n")

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(itemUrl)}</link>
      <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>
      <pubDate>${formatRssDate(item.date)}</pubDate>
      <description>${escapeXml(item.excerpt)}</description>
${categories}
    </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description || profile.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${formatRssDate(lastBuildDate)}</lastBuildDate>
    <generator>${escapeXml(profile.brandName || profile.siteName)}</generator>
    <managingEditor>${escapeXml(profile.contact.email)} (${escapeXml(profile.owner.name)})</managingEditor>
    <webMaster>${escapeXml(profile.contact.email)} (${escapeXml(profile.owner.name)})</webMaster>
${itemXml}
  </channel>
</rss>`
}

export function rssResponse(xml: string) {
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  })
}

function formatFeedTitle(siteName: string, suffix: string) {
  const normalizedSiteName = siteName.trim()
  if (!suffix) {
    return normalizedSiteName
  }

  if (normalizedSiteName.toLowerCase().includes(suffix.toLowerCase())) {
    return normalizedSiteName
  }

  return `${normalizedSiteName} ${suffix}`
}

function getLatestBuildDate(items: FeedItem[]) {
  const latest = items.reduce((current, item) => {
    const timestamp = Date.parse("updatedAt" in item && item.updatedAt ? item.updatedAt : item.date)
    if (Number.isNaN(timestamp)) {
      return current
    }
    return Math.max(current, timestamp)
  }, 0)

  return latest > 0 ? new Date(latest) : new Date()
}

function formatRssDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString()
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
