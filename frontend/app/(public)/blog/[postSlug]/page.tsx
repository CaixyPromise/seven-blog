import { notFound } from "next/navigation";
import { getPostBySlug, listRelatedPosts } from "@/lib/content/posts";
import { ArticlePageContent } from "@/components/public/blog/article-page-content";
import { generateBlogPostStructuredData } from "@/lib/structured-data";
import { getMessages, parseLocale, withLocaleHref } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";
import { getArticleThumbnailUrl } from "@/lib/content/article-thumbnail";
import type { Metadata } from "next";

export const dynamicParams = true;

interface BlogPostPageProps {
  params: Promise<{ postSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { postSlug } = await params;
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const baseUrl = getSiteUrl();
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const ogImageUrl = getArticleThumbnailUrl(post.thumbnail, "posts", post.slug);

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    keywords: post.tags,
    openGraph: {
      type: "article",
      url: postUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: new Date(post.updatedAt ?? post.date).toISOString(),
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
      creator: "@CaixyPromise",
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const [{ postSlug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [post, relatedPosts] = await Promise.all([getPostBySlug(postSlug), listRelatedPosts(postSlug)]);

  if (!post) {
    notFound();
  }

  const baseUrl = getSiteUrl();
  const structuredData = generateBlogPostStructuredData(post, baseUrl);
  const locale = parseLocale(resolvedSearchParams?.lang)
  const copy = getMessages(locale).blog;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ArticlePageContent
        article={post}
        contentKind="posts"
        backHref={withLocaleHref("/blog", locale)}
        backLabel={copy.back}
        featuredLabel={copy.featured}
        relatedArticles={relatedPosts.map((relatedPost) => ({
          id: relatedPost.id,
          href: withLocaleHref(`/blog/${relatedPost.slug}`, locale),
          title: relatedPost.title,
          excerpt: relatedPost.excerpt,
          category: relatedPost.category,
          date: relatedPost.date,
          readTime: relatedPost.readTime,
          color: relatedPost.color,
        }))}
        relatedCopy={{
          label: copy.relatedLabel,
          titlePrefix: copy.continuePrefix,
          titleHighlight: copy.continueHighlight,
        }}
      />
    </>
  );
}
