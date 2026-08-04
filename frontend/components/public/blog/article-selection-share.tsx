"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link2 } from "lucide-react"
import { toast } from "sonner"
import { copyToClipboard } from "@/components/public/blog/clipboard"
import {
  applySelectionHighlight,
  createSelectionShareUrl,
  getSelectionFloatingRect,
  parseSelectionShareParams,
  prepareSelectionShareBlocks,
  selectionIsInsideScopes,
  selectionStartsInIgnoredElement,
} from "@/components/public/blog/selection-share-utils"
import { cn } from "@/lib/utils"

interface ArticleSelectionShareProps {
  scopeSelector?: string
}

interface FloatingState {
  top: number
  left: number
  url: string
}

export function ArticleSelectionShare({ scopeSelector = "[data-selection-share-scope]" }: ArticleSelectionShareProps) {
  const [mounted, setMounted] = useState(false)
  const [floating, setFloating] = useState<FloatingState | null>(null)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    installSelectionShareHighlightStyle()
  }, [])

  useEffect(() => {
    const scopes = getScopes(scopeSelector)

    if (scopes.length === 0) {
      return
    }

    prepareSelectionShareBlocks(scopes)
    window.requestAnimationFrame(() => prepareSelectionShareBlocks(scopes))
    const params = parseSelectionShareParams(new URLSearchParams(window.location.search))
    if (params.sel || params.q) {
      window.setTimeout(() => applySelectionHighlight(scopes, params), 120)
    }

    function updateFloating() {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
      }

      hideTimerRef.current = window.setTimeout(() => {
        const selection = window.getSelection()

        if (
          !selection ||
          !selectionIsInsideScopes(selection, scopes) ||
          selectionStartsInIgnoredElement(selection)
        ) {
          setFloating(null)
          return
        }

        const selectedText = selection.toString().trim()
        if (selectedText.length < 2) {
          setFloating(null)
          return
        }

        const rect = getSelectionFloatingRect(selection)
        const url = createSelectionShareUrl(selection, scopes)

        if (!rect || !url) {
          setFloating(null)
          return
        }

        setFloating({ ...rect, url })
      }, 40)
    }

    function hideFloating() {
      setFloating(null)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        window.getSelection()?.removeAllRanges()
        hideFloating()
      } else {
        updateFloating()
      }
    }

    document.addEventListener("selectionchange", updateFloating)
    document.addEventListener("pointerup", updateFloating)
    document.addEventListener("keyup", updateFloating)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("scroll", hideFloating, { passive: true })
    window.addEventListener("resize", hideFloating)

    return () => {
      document.removeEventListener("selectionchange", updateFloating)
      document.removeEventListener("pointerup", updateFloating)
      document.removeEventListener("keyup", updateFloating)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("scroll", hideFloating)
      window.removeEventListener("resize", hideFloating)
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
      }
    }
  }, [scopeSelector])

  async function copySelectionLink() {
    if (!floating) {
      return
    }

    try {
      await copyToClipboard(floating.url)
      toast.success("已复制选区链接", {
        description: "打开链接会跳转并高亮这段文字。",
      })
      window.getSelection()?.removeAllRanges()
      setFloating(null)
    } catch (error) {
      toast.error("复制选区链接失败", {
        description: error instanceof Error ? error.message : "浏览器拒绝了剪贴板写入。",
      })
    }
  }

  if (!mounted || !floating) {
    return null
  }

  return createPortal(
    <button
      type="button"
      onPointerDown={(event) => event.preventDefault()}
      onClick={copySelectionLink}
      className={cn(
        "fixed z-[80] inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-card/95 px-3",
        "font-mono text-xs text-muted-foreground shadow-lg backdrop-blur transition-colors",
        "hover:border-primary/60 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
      style={{ top: floating.top, left: floating.left }}
      aria-label="复制选区链接"
      title="复制选区链接"
      data-selection-share-ignore
    >
      <Link2 className="h-3.5 w-3.5" />
      复制选区链接
    </button>,
    document.body,
  )
}

function getScopes(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector))
}

function installSelectionShareHighlightStyle() {
  if (document.getElementById("selection-share-highlight-style")) {
    return
  }

  const style = document.createElement("style")
  style.id = "selection-share-highlight-style"
  const selector = `::${"highlight"}(selection-share-highlight)`
  style.textContent = `
    ${selector} {
      background: color-mix(in oklch, var(--primary), transparent 74%);
      color: var(--foreground);
    }
  `
  document.head.appendChild(style)
}
