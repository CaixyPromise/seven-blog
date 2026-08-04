import { cacheFileContent } from "./file-cache"
import { getContentSource } from "./source"
import type { Note } from "./types"

export type { Note }

export async function listNotes(): Promise<Note[]> {
  return cacheFileContent(
    { key: ["notes"], tags: ["notes", "sitemap", "llms", "rss"], revalidate: 300 },
    () => getContentSource().listNotes(),
  )
}

export async function listNoteSlugs(): Promise<string[]> {
  return (await listNotes()).flatMap((note) => (note.slug ? [note.slug] : []))
}

export async function getNoteBySlug(slug: string): Promise<Note | undefined> {
  return cacheFileContent(
    { key: ["note", slug], tags: ["notes", `note:${slug}`], revalidate: 300 },
    () => getContentSource().getNoteBySlug(slug),
  )
}

export async function listRelatedNotes(currentSlug: string, limit = 3): Promise<Note[]> {
  const notes = await listNotes()
  const currentNote = notes.find((note) => note.slug === currentSlug)
  if (!currentNote) return []

  return notes
    .filter((note) => note.slug && note.slug !== currentSlug)
    .filter(
      (note) =>
        note.category === currentNote.category ||
        note.tags.some((tag) => currentNote.tags.includes(tag)),
    )
    .slice(0, limit)
}
