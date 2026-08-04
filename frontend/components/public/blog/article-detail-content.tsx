import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArticleReadingTools } from "@/components/public/blog/article-reading-tools"
import { ArticleSelectionShare } from "@/components/public/blog/article-selection-share"
import { BlogPostActions } from "@/components/public/blog/blog-post-actions"
import { BlogToc } from "@/components/public/blog/blog-toc"
import { codeLicense, contentLicense } from "@/components/public/blog/markdown-copy"
import { MarkdownContent } from "@/components/public/blog/markdown-content"
import { extractMarkdownHeadings, type MarkdownContentKind } from "@/components/public/blog/markdown-utils"

interface ArticleDetailContentProps {
  backHref: string
  backLabel: string
  title: string
  excerpt: string
  content: string
  slug?: string
  contentKind?: MarkdownContentKind
  category: string
  date: string
  readTime?: string
  tags: string[]
  color?: string
  featured?: boolean
  featuredLabel?: string
  author?: {
    name: string
    avatar: string
    role: string
  }
}

export function ArticleDetailContent({
  backHref,
  backLabel,
  title,
  excerpt,
  content,
  slug,
  contentKind = "posts",
  category,
  date,
  readTime,
  tags,
  color,
  featured,
  featuredLabel = "推荐",
  author,
}: ArticleDetailContentProps) {
  const headings = [
    { id: "article-start", depth: 1, text: title },
    ...extractMarkdownHeadings(content, 2, 4),
  ]

  return (
    <>
      <section className="relative border-b border-border/30 px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32">
        <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-30", color)} />
        <div className="relative z-10 mx-auto max-w-4xl" data-selection-share-scope>
          <Link
            href={backHref}
            className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary animate-fade-in-up"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-mono">{backLabel}</span>
          </Link>

          <div className="mb-6 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <span className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-primary">
              {category}
            </span>
            {featured ? (
              <span className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 font-mono text-xs text-amber-500 dark:text-amber-300">
                {featuredLabel}
              </span>
            ) : null}
          </div>

          <h1
            id="article-start"
            className="scroll-mt-28 mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <span className="text-foreground dark:bg-gradient-to-l dark:from-primary/70 dark:to-accent dark:bg-clip-text dark:text-transparent">
              {title}
            </span>
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-6 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            {author ? (
              <div className="flex items-center gap-4">
                <img src={author.avatar || "/placeholder.svg"} alt={author.name} className="h-12 w-12 rounded-full border-2 border-border object-cover" />
                <div>
                  <p className="font-medium">{author.name}</p>
                  <p className="text-sm text-muted-foreground">{author.role}</p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {date}
              </span>
              {readTime ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {readTime}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/50 bg-secondary/60 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground animate-fade-in-up" style={{ animationDelay: "350ms" }}>
            <Scale className="h-3.5 w-3.5 text-primary" />
            <a
              href={contentLicense.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border/50 bg-background/60 px-2.5 py-1 font-mono transition-colors hover:border-primary/50 hover:text-primary"
            >
              Content: {contentLicense.name}
            </a>
            <a
              href={codeLicense.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border/50 bg-background/60 px-2.5 py-1 font-mono transition-colors hover:border-primary/50 hover:text-primary"
            >
              Code: {codeLicense.name}
            </a>
          </div>
        </div>
      </section>

      <ArticleReadingTools headings={headings} />
      <ArticleSelectionShare />
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-8 lg:grid-cols-[13rem_minmax(0,1fr)_auto]">
            <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] self-start lg:block">
              <BlogToc headings={headings} />
            </aside>

            <MarkdownContent content={content} slug={slug} contentKind={contentKind} className="min-w-0 animate-fade-in-up" />

            <aside className="hidden animate-fade-in-up lg:block" style={{ animationDelay: "400ms" }}>
              <BlogPostActions title={title} excerpt={excerpt} markdownContent={content} variant="desktop" />
            </aside>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4 border-t border-border/30 pt-8 animate-fade-in-up lg:hidden" style={{ animationDelay: "450ms" }}>
            <BlogPostActions title={title} excerpt={excerpt} markdownContent={content} variant="mobile" />
          </div>
        </div>
      </section>
    </>
  )
}
