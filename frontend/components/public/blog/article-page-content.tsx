import Link from "next/link"
import { ArticleDetailContent } from "@/components/public/blog/article-detail-content"
import type { MarkdownContentKind } from "@/components/public/blog/markdown-utils"
import type { Author } from "@/lib/content/types"
import { cn } from "@/lib/utils"

interface ArticlePageItem {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime?: string
  tags: string[]
  color?: string
  featured?: boolean
  author: Author
}

interface RelatedArticleItem {
  id: number
  href: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime?: string
  color?: string
}

interface ArticlePageContentProps {
  article: ArticlePageItem
  contentKind: MarkdownContentKind
  backHref: string
  backLabel: string
  featuredLabel: string
  relatedArticles: RelatedArticleItem[]
  relatedCopy: {
    label: string
    titlePrefix: string
    titleHighlight: string
  }
}

export function ArticlePageContent({
  article,
  contentKind,
  backHref,
  backLabel,
  featuredLabel,
  relatedArticles,
  relatedCopy,
}: ArticlePageContentProps) {
  return (
    <>
      <ArticleDetailContent
        backHref={backHref}
        backLabel={backLabel}
        title={article.title}
        excerpt={article.excerpt}
        content={article.content}
        slug={article.slug}
        contentKind={contentKind}
        category={article.category}
        date={article.date}
        readTime={article.readTime}
        tags={article.tags}
        color={article.color}
        featured={article.featured}
        featuredLabel={featuredLabel}
        author={article.author}
      />

      {relatedArticles.length > 0 ? (
        <section className="border-t border-border/30 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <span className="mb-4 inline-block rounded-lg border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs tracking-wider text-muted-foreground">
                {relatedCopy.label}
              </span>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {relatedCopy.titlePrefix}{" "}
                <span className="text-foreground dark:bg-gradient-to-l dark:from-primary/70 dark:to-accent dark:bg-clip-text dark:text-transparent">
                  {relatedCopy.titleHighlight}
                </span>
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle, index) => (
                <Link
                  key={`${relatedArticle.href}-${relatedArticle.id}`}
                  href={relatedArticle.href}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-5 glass transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                      relatedArticle.color,
                    )}
                  />
                  <div className="relative z-10">
                    <span className="mb-3 inline-block rounded-md bg-secondary/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      {relatedArticle.category}
                    </span>
                    <h3 className="mb-2 line-clamp-2 font-semibold transition-colors group-hover:text-gradient">
                      {relatedArticle.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {relatedArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{relatedArticle.date}</span>
                      {relatedArticle.readTime ? (
                        <>
                          <span className="text-border">•</span>
                          <span>{relatedArticle.readTime}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-transparent transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
