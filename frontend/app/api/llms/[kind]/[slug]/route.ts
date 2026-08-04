import { notFound } from "next/navigation"
import { getNoteBySlug } from "@/lib/content/notes"
import { getPostBySlug } from "@/lib/content/posts"
import { generateNoteLlmsEntry, generatePostLlmsEntry } from "@/lib/llms"

interface LlmsEntryRouteProps {
  params: Promise<{ kind: string; slug: string }>
}

export async function GET(_request: Request, { params }: LlmsEntryRouteProps) {
  const { kind, slug } = await params

  if (kind === "blog") {
    const post = await getPostBySlug(slug)
    if (!post) {
      notFound()
    }

    return textResponse(generatePostLlmsEntry(post))
  }

  if (kind === "note") {
    const note = await getNoteBySlug(slug)
    if (!note) {
      notFound()
    }

    return textResponse(generateNoteLlmsEntry(note))
  }

  notFound()
}

function textResponse(body: string) {
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
