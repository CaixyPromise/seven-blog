import { BlogHero } from "@/components/public/blog/blog-hero";
import { BlogPageContent } from "@/components/public/blog/blog-page-content";
import type { BlogListItem } from "@/components/public/blog/blog-list";
import { listPopularTags, listPostCategories, listPosts } from "@/lib/content/posts";
import { getMessages, parseLocale } from "@/lib/i18n";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

interface BlogPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const locale = parseLocale((await searchParams)?.lang)
  const copy = getMessages(locale).blog
  const path = locale === "en" ? "/blog?lang=en" : "/blog"
  const title = locale === "zh" ? "博客" : "Blog"

  return {
    title,
    description: copy.description,
    openGraph: {
      title: `${title} — CaixyPromise`,
      description: copy.description,
      url: `${baseUrl}${path}`,
      type: "website",
      images: [{ url: `${baseUrl}/blog/opengraph-image`, width: 1200, height: 630, alt: `CaixyPromise ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — CaixyPromise`,
      description: copy.description,
      images: [`${baseUrl}/blog/opengraph-image`],
    },
    alternates: { canonical: `${baseUrl}${path}` },
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = parseLocale((await searchParams)?.lang)
  const copy = getMessages(locale).blog
  const [posts, categories, popularTags] = await Promise.all([
    listPosts(),
    listPostCategories(),
    listPopularTags(),
  ]);
  const postSummaries: BlogListItem[] = posts.map(({ content, ...post }) => post);

  return (
    <div>
      <BlogHero copy={copy} />
      <section className="px-4 sm:px-6 py-16 sm:py-20 border-t border-border/30">
        <div className="mx-auto max-w-7xl">
          <BlogPageContent
            posts={postSummaries}
            categories={categories}
            popularTags={popularTags}
            copy={copy}
            locale={locale}
          />
        </div>
      </section>
    </div>
  );
}
