import { listPosts } from "@/lib/content/posts"
import { getProfileContent } from "@/lib/content/site"
import { generateRssFeed, rssResponse } from "@/lib/rss"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const [profile, posts] = await Promise.all([getProfileContent(), listPosts()])

  const rss = generateRssFeed({
    profile,
    items: posts,
    baseUrl,
    feedPath: "/rss.xml",
    sectionPath: "/blog",
    itemPathPrefix: "/blog",
    titleSuffix: "Blog",
    description: profile.description,
  })

  return rssResponse(rss)
}
