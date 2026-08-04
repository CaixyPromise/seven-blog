"use client"

import { useEffect, useState } from "react"
import { BookOpen, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MarkdownHeading } from "@/components/public/blog/markdown-utils"

interface ArticleReadingToolsProps {
  headings: MarkdownHeading[]
}

export function ArticleReadingTools({ headings }: ArticleReadingToolsProps) {
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "")
  const [tocOpen, setTocOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ id: string; text: string }>>([])

  useEffect(() => {
    let ticking = false

    function update() {
      ticking = false
      const scrollTop = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      setProgress(height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0)

      let current = headings[0]?.id ?? ""
      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element && element.getBoundingClientRect().top <= 140) {
          current = heading.id
        }
      }
      setActiveId(current)
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [headings])

  useEffect(() => {
    if (!searchOpen && !tocOpen) {
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [searchOpen, tocOpen])

  useEffect(() => {
    const term = query.trim().toLowerCase()
    if (!term) {
      setSearchResults([])
      return
    }

    const article = document.querySelector("[data-article-content]")
    const blocks = Array.from(
      article?.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id], p, li, td, th, blockquote") ?? [],
    )
    const results: Array<{ id: string; text: string }> = []

    blocks.forEach((block, index) => {
      const text = block.textContent?.replace(/\s+/g, " ").trim() ?? ""
      if (!text || !text.toLowerCase().includes(term)) {
        return
      }

      if (!block.id) {
        block.id = `article-search-result-${index}`
        block.classList.add("scroll-mt-28")
      }

      results.push({ id: block.id, text })
    })

    setSearchResults(results.slice(0, 20))
  }, [query])

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    setTocOpen(false)
    setSearchOpen(false)
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-[72px] z-40 h-0.5 bg-border/30">
        <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/60 bg-card/90 p-1.5 shadow-lg backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setTocOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label="打开目录"
        >
          <BookOpen className="h-4 w-4" />
          目录
        </button>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label="搜索当前文章"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {tocOpen ? (
        <MobilePanel title="文章目录" onClose={() => setTocOpen(false)}>
          <div className="space-y-1">
            {headings.map((heading) => {
              const active = heading.id === activeId
              return (
                <button
                  key={heading.id}
                  type="button"
                  onClick={() => jumpTo(heading.id)}
                  className={cn(
                    "block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors",
                    heading.depth >= 3 && "pl-6 text-xs",
                    heading.depth >= 4 && "pl-9",
                    active && "bg-primary/10 text-primary",
                  )}
                >
                  {heading.text}
                </button>
              )
            })}
          </div>
        </MobilePanel>
      ) : null}

      {searchOpen ? (
        <MobilePanel title="搜索当前文章" onClose={() => setSearchOpen(false)}>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入章节关键词..."
              autoFocus
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            {query.trim() && searchResults.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">没有匹配的章节</p>
            ) : null}
            {searchResults.map((heading) => (
              <button
                key={heading.id}
                type="button"
                onClick={() => jumpTo(heading.id)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <span className="line-clamp-2">{heading.text}</span>
              </button>
            ))}
          </div>
        </MobilePanel>
      ) : null}
    </>
  )
}

function MobilePanel({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[90] bg-background/70 backdrop-blur lg:hidden" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="关闭" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(75vh-3.5rem)] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
