import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getNoteBySlug, listRelatedNotes } from "@/lib/content/notes"
import { getProfileContent } from "@/lib/content/site"
import { getMessages, parseLocale, withLocaleHref } from "@/lib/i18n"
import { ArticlePageContent } from "@/components/public/blog/article-page-content"
import { generateNoteStructuredData } from "@/lib/structured-data"
import { getSiteUrl } from "@/lib/site-url"

export const dynamicParams = true

interface NotePageProps {
  params: Promise<{ noteSlug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { noteSlug } = await params
  const note = await getNoteBySlug(noteSlug)
  if (!note) {
    return { title: "Note Not Found" }
  }

  const baseUrl = getSiteUrl()
  const noteUrl = `${baseUrl}/notes/${note.slug ?? noteSlug}`
  const ogImageUrl = `${noteUrl}/opengraph-image`
  return {
    title: note.title,
    description: note.excerpt,
    openGraph: {
      title: note.title,
      description: note.excerpt,
      url: noteUrl,
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: note.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.excerpt,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: noteUrl,
    },
  }
}

export default async function NotePage({ params, searchParams }: NotePageProps) {
  const [{ noteSlug }, resolvedSearchParams] = await Promise.all([params, searchParams])
  const locale = parseLocale(resolvedSearchParams?.lang)
  const [note, relatedNotes, profile] = await Promise.all([
    getNoteBySlug(noteSlug),
    listRelatedNotes(noteSlug),
    getProfileContent(locale),
  ])

  if (!note) {
    notFound()
  }

  const copy = getMessages(locale).notes
  const baseUrl = getSiteUrl()
  const structuredData = generateNoteStructuredData(note, baseUrl)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ArticlePageContent
        article={{
          ...note,
          slug: note.slug!,
          author: {
            name: profile.owner.name,
            avatar: profile.owner.avatar,
            role: profile.owner.role,
          },
        }}
        contentKind="notes"
        backHref={withLocaleHref("/notes", locale)}
        backLabel={copy.back}
        featuredLabel={copy.featured}
        relatedArticles={relatedNotes.flatMap((relatedNote) =>
          relatedNote.slug
            ? [{
                id: relatedNote.id,
                href: withLocaleHref(`/notes/${relatedNote.slug}`, locale),
                title: relatedNote.title,
                excerpt: relatedNote.excerpt,
                category: relatedNote.category,
                date: relatedNote.date,
                readTime: relatedNote.readTime,
                color: relatedNote.color,
              }]
            : [],
        )}
        relatedCopy={{
          label: copy.relatedLabel,
          titlePrefix: copy.continuePrefix,
          titleHighlight: copy.continueHighlight,
        }}
      />
    </>
  )
}
