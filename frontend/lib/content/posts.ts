import { cacheFileContent } from "./file-cache"
import { getContentSource } from "./source"
import type { BlogPost } from "./types"

export type { BlogPost }

export async function listPosts(): Promise<BlogPost[]> {
  return cacheFileContent(
    { key: ["posts"], tags: ["posts", "sitemap", "llms", "rss"], revalidate: 300 },
    () => getContentSource().listPosts(),
  )
}

export async function listPostSlugs(): Promise<string[]> {
  return getContentSource().listPostSlugs()
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return cacheFileContent(
    { key: ["post", slug], tags: ["posts", `post:${slug}`], revalidate: 300 },
    () => getContentSource().getPostBySlug(slug),
  )
}

export async function listRelatedPosts(currentSlug: string, limit = 3): Promise<BlogPost[]> {
  const posts = await listPosts()
  const currentPost = posts.find((post) => post.slug === currentSlug)
  if (!currentPost) return []

  return posts
    .filter((post) => post.slug !== currentSlug)
    .filter((post) => post.category === currentPost.category || post.tags.some((tag) => currentPost.tags.includes(tag)))
    .slice(0, limit)
}

export async function listPostCategories(): Promise<Array<{ slug: string; name: string; count: number }>> {
  const posts = await listPosts()
  const categories = new Map<string, number>()
  for (const post of posts) {
    categories.set(post.category, (categories.get(post.category) ?? 0) + 1)
  }

  return [
    { slug: "all", name: "All Posts", count: posts.length },
    ...Array.from(categories, ([slug, count]) => ({
      slug,
      name: slug,
      count,
    })),
  ]
}

export async function listPopularTags(limit = 10): Promise<string[]> {
  const posts = await listPosts()
  const tagCounts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag)
}
