"use client"

import { useEffect, useId, useLayoutEffect, useState, type ReactNode } from "react"
import { Check, ChevronDown, Link2 } from "lucide-react"
import { toast } from "sonner"
import { copyToClipboard } from "@/components/public/blog/clipboard"
import { cn } from "@/lib/utils"

interface ArticleHeadingProps {
  id: string
  level: 1 | 2 | 3 | 4
  children: ReactNode
}

const headingTagByLevel = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const

export function ArticleHeading({ id, level, children }: ArticleHeadingProps) {
  const reactId = useId()
  const collapseId = `heading-collapse-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)
  const HeadingTag = headingTagByLevel[level]

  useLayoutEffect(() => {
    const heading = document.getElementById(id)
    if (!heading) {
      return
    }

    const affected = getHeadingSectionNodes(heading, level)
    affected.forEach((node) => animateSectionNode(node, collapsed, collapseId))

    return () => {
      affected.forEach((node) => {
        if (node instanceof HTMLElement && node.dataset.collapsedBy === collapseId) {
          expandSectionNode(node)
        }
      })
    }
  }, [collapseId, collapsed, id, level])

  async function copyHeadingLink() {
    const url = new URL(window.location.href)
    url.hash = id

    try {
      await copyToClipboard(url.toString())
      setCopied(true)
      toast.success("已复制标题链接")
      window.setTimeout(() => setCopied(false), 1200)
    } catch (error) {
      toast.error("复制标题链接失败", {
        description: error instanceof Error ? error.message : "浏览器拒绝了剪贴板写入。",
      })
    }
  }

  return (
    <HeadingTag
      id={id}
      data-article-heading-level={level}
      className={cn(
        "group flex scroll-mt-28 items-center gap-1.5",
        level === 1 && "text-3xl",
        level === 2 && "text-2xl",
        level === 3 && "text-xl",
        level === 4 && "text-lg",
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className={cn(
          "not-prose -ml-6 inline-flex h-6 w-5 shrink-0 items-center justify-center rounded-md text-primary opacity-0 transition-all duration-150",
          "hover:bg-primary/10 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100",
          "max-lg:ml-0 max-lg:opacity-100",
          collapsed && "opacity-100",
        )}
        title={collapsed ? "展开当前章节" : "折叠当前章节"}
        aria-label={collapsed ? "展开当前章节" : "折叠当前章节"}
        data-selection-share-ignore
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed && "-rotate-90")} />
      </button>

      <span className={cn("min-w-0", collapsed && "text-muted-foreground")}>{children}</span>

      <button
        type="button"
        onClick={copyHeadingLink}
        className={cn(
          "not-prose inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all duration-150",
          "hover:bg-primary/10 hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100",
          copied && "bg-primary/10 text-primary opacity-100",
        )}
        title={copied ? "已复制标题链接" : "复制标题链接"}
        aria-label={copied ? "已复制标题链接" : "复制标题链接"}
        data-selection-share-ignore
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      </button>
    </HeadingTag>
  )
}

function getHeadingSectionNodes(heading: HTMLElement, level: number) {
  const nodes: Element[] = []
  let current = heading.nextElementSibling

  while (current) {
    const nextLevel = getHeadingLevel(current)
    if (nextLevel !== null && nextLevel <= level) {
      break
    }

    nodes.push(current)
    current = current.nextElementSibling
  }

  return nodes
}

function getHeadingLevel(element: Element) {
  const explicitLevel = element.getAttribute("data-article-heading-level")
  if (explicitLevel) {
    return Number(explicitLevel)
  }

  const match = /^H([1-6])$/.exec(element.tagName)
  return match ? Number(match[1]) : null
}

function animateSectionNode(node: Element, collapsed: boolean, collapseId: string) {
  if (!(node instanceof HTMLElement)) {
    return
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (collapsed) {
      node.dataset.collapsedBy = collapseId
      setCollapsedSectionStyles(node)
    } else if (node.dataset.collapsedBy === collapseId) {
      restoreSectionNode(node)
    }
    return
  }

  window.clearTimeout(Number(node.dataset.collapseTimer || 0))

  if (collapsed) {
    collapseSectionNode(node, collapseId)
    return
  }

  if (node.dataset.collapsedBy === collapseId) {
    expandSectionNode(node)
  }
}

function collapseSectionNode(node: HTMLElement, collapseId: string) {
  const height = node.getBoundingClientRect().height
  const computedStyle = window.getComputedStyle(node)

  node.dataset.collapsedBy = collapseId
  node.dataset.collapseMarginTop = computedStyle.marginTop
  node.dataset.collapseMarginBottom = computedStyle.marginBottom
  node.style.overflow = "hidden"
  node.style.height = `${height}px`
  node.style.opacity = "1"
  node.style.transitionProperty = "height, opacity"
  node.style.transitionDuration = "180ms"
  node.style.transitionTimingFunction = "ease"
  node.style.willChange = "height, opacity"

  node.getBoundingClientRect()

  window.requestAnimationFrame(() => {
    setCollapsedSectionStyles(node)
  })

  node.dataset.collapseTimer = String(
    window.setTimeout(() => {
      node.style.removeProperty("will-change")
    }, 210),
  )
}

function expandSectionNode(node: HTMLElement) {
  const marginTop = node.dataset.collapseMarginTop || ""
  const marginBottom = node.dataset.collapseMarginBottom || ""

  node.style.overflow = "hidden"
  node.style.height = "0px"
  node.style.opacity = "0"
  node.style.marginTop = "0px"
  node.style.marginBottom = "0px"
  node.style.transitionProperty = "height, opacity, margin"
  node.style.transitionDuration = "200ms"
  node.style.transitionTimingFunction = "ease"
  node.style.willChange = "height, opacity, margin"

  const targetHeight = node.scrollHeight

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      node.style.height = `${targetHeight}px`
      node.style.opacity = "1"
      if (marginTop) {
        node.style.marginTop = marginTop
      } else {
        node.style.removeProperty("margin-top")
      }
      if (marginBottom) {
        node.style.marginBottom = marginBottom
      } else {
        node.style.removeProperty("margin-bottom")
      }
    })
  })

  node.dataset.collapseTimer = String(
    window.setTimeout(() => {
      restoreSectionNode(node)
    }, 240),
  )
}

function setCollapsedSectionStyles(node: HTMLElement) {
  node.style.height = "0px"
  node.style.opacity = "0"
  node.style.marginTop = "0px"
  node.style.marginBottom = "0px"
  node.style.overflow = "hidden"
  node.style.pointerEvents = "none"
}

function restoreSectionNode(node: HTMLElement) {
  delete node.dataset.collapsedBy
  delete node.dataset.collapseTimer
  delete node.dataset.collapseMarginTop
  delete node.dataset.collapseMarginBottom
  node.style.removeProperty("overflow")
  node.style.removeProperty("height")
  node.style.removeProperty("opacity")
  node.style.removeProperty("transform")
  node.style.removeProperty("transition-property")
  node.style.removeProperty("transition-duration")
  node.style.removeProperty("transition-timing-function")
  node.style.removeProperty("transition-delay")
  node.style.removeProperty("will-change")
  node.style.removeProperty("margin-top")
  node.style.removeProperty("margin-bottom")
  node.style.removeProperty("pointer-events")
}
