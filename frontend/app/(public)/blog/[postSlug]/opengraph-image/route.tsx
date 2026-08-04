import { getPostBySlug } from "@/lib/content/posts"
import { createOgImage } from "@/lib/og/image-response"

interface BlogPostOpenGraphImageProps {
  params: Promise<{ postSlug: string }>
}

export async function GET(_request: Request, { params }: BlogPostOpenGraphImageProps) {
  const { postSlug } = await params
  const post = await getPostBySlug(postSlug)

  return createOgImage({
    eyebrow: post ? `CaixyPromise Blog · ${post.category}` : "CaixyPromise Blog",
    title: post?.title ?? "Post Not Found",
    subtitle: post?.excerpt ?? "This article is not available.",
    footer: `eindev.ir/blog/${postSlug}`,
  })
}
