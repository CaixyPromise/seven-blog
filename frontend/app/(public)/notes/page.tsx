import { NotesPageContent } from "@/components/public/notes/notes-page-content";
import { listNotes } from "@/lib/content/notes";
import { getMessages, parseLocale } from "@/lib/i18n";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

type NotesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: NotesPageProps): Promise<Metadata> {
  const locale = parseLocale((await searchParams)?.lang)
  const copy = getMessages(locale).notes
  const path = locale === "en" ? "/notes?lang=en" : "/notes"

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: `${copy.title} — CaixyPromise`,
      description: copy.description,
      url: `${baseUrl}${path}`,
      type: "website",
      images: [{ url: `${baseUrl}/notes/opengraph-image`, width: 1200, height: 630, alt: `CaixyPromise ${copy.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${copy.title} — CaixyPromise`,
      description: copy.description,
      images: [`${baseUrl}/notes/opengraph-image`],
    },
    alternates: { canonical: `${baseUrl}${path}` },
  }
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const notes = await listNotes();

  return (
    <div className="pt-24">
      <NotesPageContent notes={notes} />
    </div>
  );
}
