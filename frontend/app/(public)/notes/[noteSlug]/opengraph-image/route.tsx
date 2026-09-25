import { getNoteBySlug } from "@/lib/content/notes"
import { createOgImage } from "@/lib/og/image-response"
import { getSiteUrl } from "@/lib/site-url"

interface NoteOpenGraphImageProps {
  params: Promise<{ noteSlug: string }>
}

export async function GET(_request: Request, { params }: NoteOpenGraphImageProps) {
  const { noteSlug } = await params
  const note = await getNoteBySlug(noteSlug)

  if (!note) {
    return new Response("Note not found", { status: 404 })
  }

  return createOgImage({
    eyebrow: note.category ? `CaixyPromise Notes · ${note.category}` : "CaixyPromise Notes",
    title: note.title,
    subtitle: note.excerpt,
    footer: `${getSiteUrl()}/notes/${note.slug ?? noteSlug}`,
  })
}
