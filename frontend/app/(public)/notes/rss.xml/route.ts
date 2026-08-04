import { listNotes } from "@/lib/content/notes"
import { getProfileContent } from "@/lib/content/site"
import { generateRssFeed, rssResponse } from "@/lib/rss"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const [profile, notes] = await Promise.all([getProfileContent(), listNotes()])

  const rss = generateRssFeed({
    profile,
    items: notes,
    baseUrl,
    feedPath: "/notes/rss.xml",
    sectionPath: "/notes",
    itemPathPrefix: "/notes",
    titleSuffix: "Notes",
    description: `${profile.siteName} 随笔订阅：想法、片段、观察和阶段性反思。`,
  })

  return rssResponse(rss)
}
