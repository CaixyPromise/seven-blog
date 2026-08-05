import { notFound } from "next/navigation"
import { getPostBySlug } from "@/lib/content/posts"
import { absolutizeMarkdownAssetLinks } from "@/lib/markdown-artifacts"

interface BlogPostMarkdownProps {
  params: Promise<{ postSlug: string }>
}

export async function GET(_request: Request, { params }: BlogPostMarkdownProps) {
  const { postSlug } = await params
  const post = await getPostBySlug(postSlug)

  if (!post) {
    notFound()
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "")
  const postUrl = `${baseUrl}/blog/${post.slug}`
  const assetBaseUrl = `${baseUrl}/content-assets/posts/${post.slug}`
  const content = absolutizeMarkdownAssetLinks(post.content.trim(), postUrl, assetBaseUrl)

  return new Response(
    `# ${post.title}

> ${post.excerpt}

- Date: ${post.date}
- Category: ${post.category}
- Tags: ${post.tags.join(", ")}
- Author: ${post.author.name}
- Read time: ${post.readTime}

${content}
`,
    {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
      },
    },
  )
}
