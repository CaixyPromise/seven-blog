import { WorkbenchPageContent } from "@/components/public/workbench/workbench-page-content";
import { listWorkbenchActivity, listWorkbenchItems } from "@/lib/content/workbench";
import { getMessages, parseLocale } from "@/lib/i18n";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eindev.ir';

interface WorkbenchPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: WorkbenchPageProps): Promise<Metadata> {
  const locale = parseLocale((await searchParams)?.lang)
  const copy = getMessages(locale).workbench
  const path = locale === "en" ? "/workbench?lang=en" : "/workbench"

  return {
    title: copy.title,
    description: copy.description,
    keywords: ["Seven Agent", "Xiaozhi", "AI Agent", "LLM", "MCP", "workbench"],
    openGraph: {
      title: `${copy.title} — CaixyPromise`,
      description: copy.description,
      url: `${baseUrl}${path}`,
      type: "website",
      images: [{ url: `${baseUrl}/workbench/opengraph-image`, width: 1200, height: 630, alt: `CaixyPromise ${copy.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${copy.title} — CaixyPromise`,
      description: copy.description,
      images: [`${baseUrl}/workbench/opengraph-image`],
    },
    alternates: { canonical: `${baseUrl}${path}` },
  }
}

export default async function WorkbenchPage({ searchParams }: WorkbenchPageProps) {
  const locale = parseLocale((await searchParams)?.lang)
  const copy = getMessages(locale).workbench
  const [items, activity] = await Promise.all([listWorkbenchItems(), listWorkbenchActivity()]);

  return (
    <div className="pt-24">
      <WorkbenchPageContent items={items} activity={activity} copy={copy} />
    </div>
  );
}
