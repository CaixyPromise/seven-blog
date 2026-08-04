"use client"

import { useEffect, useRef, useState } from "react"
import { ListTree } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MarkdownHeading } from "@/components/public/blog/markdown-utils"

interface BlogTocProps {
  headings: MarkdownHeading[]
}

export function BlogToc({ headings }: BlogTocProps) {
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())
  const [primaryActiveId, setPrimaryActiveId] = useState(headings[0]?.id ?? "")
  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set(headings[0]?.id ? [headings[0].id] : []))

  useEffect(() => {
    if (headings.length === 0) {
      return
    }

    let ticking = false

    function updateActiveHeading() {
      ticking = false
      const viewportTop = 120
      const viewportBottom = window.innerHeight * 0.82
      let current = headings[0]?.id ?? ""
      const visible = new Set<string>()

      headings.forEach((heading, index) => {
        const element = document.getElementById(heading.id)
        if (!element) {
          return
        }

        const nextElement = headings[index + 1] ? document.getElementById(headings[index + 1].id) : null
        const rect = element.getBoundingClientRect()
        const sectionTop = rect.top
        const sectionBottom = nextElement?.getBoundingClientRect().top ?? document.body.getBoundingClientRect().bottom
        const intersectsViewport = sectionBottom > viewportTop && sectionTop < viewportBottom

        if (intersectsViewport) {
          visible.add(heading.id)
        }

        if (sectionTop <= viewportTop) {
          current = heading.id
        }
      })

      if (visible.size === 0 && current) {
        visible.add(current)
      }

      setPrimaryActiveId(current)
      setActiveIds(visible)
    }

    function handleScroll() {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(updateActiveHeading)
      }
    }

    updateActiveHeading()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [headings])

  useEffect(() => {
    const nav = navRef.current
    const activeLink = linkRefs.current.get(primaryActiveId)
    if (!nav || !activeLink) {
      return
    }

    const navRect = nav.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    const targetTop = nav.scrollTop + (linkRect.top - navRect.top) - nav.clientHeight * 0.42 + linkRect.height / 2

    nav.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    })
  }, [primaryActiveId])

  if (headings.length === 0) {
    return null
  }

  function jumpToHeading(id: string) {
    const element = document.getElementById(id)
    if (!element) {
      return
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", `#${id}`)
  }

  return (
    <nav
      ref={navRef}
      className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scroll-smooth"
      aria-label="文章目录"
    >
      <div className="sticky top-0 z-10 mb-4 flex items-center gap-2 bg-background/85 py-1 text-primary backdrop-blur">
        <ListTree className="h-4 w-4" />
        <span className="font-mono text-xs uppercase tracking-wider">目录</span>
      </div>
      <ol className="relative space-y-1 border-l border-border/60 pl-3">
        {headings.map((heading) => {
          const active = activeIds.has(heading.id)
          const primary = primaryActiveId === heading.id
          return (
            <li key={heading.id}>
              <a
                ref={(node) => {
                  if (node) {
                    linkRefs.current.set(heading.id, node)
                  } else {
                    linkRefs.current.delete(heading.id)
                  }
                }}
                href={`#${heading.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  jumpToHeading(heading.id)
                }}
                className={cn(
                  "group relative block rounded-md px-3 py-2 text-sm text-muted-foreground transition-all duration-300",
                  "hover:bg-primary/10 hover:text-primary hover:translate-x-0.5",
                  heading.depth >= 3 && "ml-3 text-xs",
                  heading.depth >= 4 && "ml-6",
                  active && "bg-primary/5 text-foreground",
                  primary && "translate-x-1 bg-primary/12 text-primary shadow-[inset_2px_0_0_var(--primary)]",
                )}
              >
                <span
                  className={cn(
                    "absolute -left-[17px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-border transition-all duration-200",
                    active && "h-2 w-2 bg-primary/70",
                    primary && "h-3 w-3 bg-primary shadow-[0_0_16px_var(--primary)]",
                  )}
                />
                <span
                  className={cn(
                    "line-clamp-2 transition-opacity duration-300",
                    !active && !primary && "opacity-70 group-hover:opacity-100",
                  )}
                >
                  {heading.text}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
