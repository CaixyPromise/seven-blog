"use client"

import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { Check, Copy, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { appendContentLicenseNotice, formatMermaidFence } from "@/components/public/blog/markdown-copy"
import { getCopyFeedbackLabel, useCopyFeedback } from "@/components/public/blog/use-copy-feedback"

interface MermaidBlockProps {
  chart: string
}

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const reactId = useId()
  const [svg, setSvg] = useState("")
  const [error, setError] = useState<string | null>(null)
  const copyFeedback = useCopyFeedback({ successMessage: "已复制 Markdown Mermaid" })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    let cancelled = false
    const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`
    const isDark = document.documentElement.classList.contains("dark")

    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            background: "transparent",
            primaryColor: isDark ? "#111827" : "#eef2ff",
            primaryBorderColor: "#8b5cf6",
            primaryTextColor: isDark ? "#f9fafb" : "#111827",
            lineColor: isDark ? "#9ca3af" : "#4b5563",
            textColor: isDark ? "#f9fafb" : "#111827",
          },
        })

        const result = await mermaid.render(renderId, chart)
        if (!cancelled) {
          setSvg(result.svg)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render Mermaid diagram")
          setSvg("")
        }
      }
    }

    void renderMermaid()

    return () => {
      cancelled = true
    }
  }, [chart, reactId])

  useEffect(() => {
    if (!previewOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [previewOpen])

  async function handleCopy() {
    await copyFeedback.copy(appendContentLicenseNotice(formatMermaidFence(chart), { sourceUrl: window.location.href }))
  }

  function openPreview() {
    setZoom(1)
    setPreviewOpen(true)
  }

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <code>{error}</code>
      </pre>
    )
  }

  if (!svg) {
    return (
      <div className="my-6 rounded-xl border border-border/60 bg-card/50 p-6 text-sm text-muted-foreground">
        Rendering diagram...
      </div>
    )
  }

  const previewDialog = previewOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label="Mermaid 图表预览"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              mermaid preview
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                title="缩小"
                aria-label="缩小"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-14 text-center font-mono text-xs text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(3, Number((value + 0.1).toFixed(2))))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                title="放大"
                aria-label="放大"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                title="重置缩放"
                aria-label="重置缩放"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                title="复制 Markdown Mermaid"
                aria-label="复制 Markdown Mermaid"
              >
                {copyFeedback.isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                title="关闭预览"
                aria-label="关闭预览"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="flex min-h-full min-w-full items-center justify-center">
              <div
                className="origin-center [&_svg]:h-auto [&_svg]:max-w-none [&_svg]:!bg-transparent"
                style={{ transform: `scale(${zoom})` }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <figure className="not-prose my-8 overflow-hidden rounded-xl border border-border/60 bg-card/60">
        <figcaption className="flex min-h-10 items-center justify-between gap-3 border-b border-border/50 px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">mermaid</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border border-border/60 px-2.5 font-mono text-xs text-muted-foreground transition-colors",
                "hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
              )}
              title="复制 Markdown Mermaid"
              aria-label="复制 Markdown Mermaid"
            >
              {copyFeedback.isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {getCopyFeedbackLabel(copyFeedback.status)}
            </button>
            <button
              type="button"
              onClick={openPreview}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              title="放大预览"
              aria-label="放大预览"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </figcaption>
        <div
          role="button"
          tabIndex={0}
          onClick={openPreview}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              openPreview()
            }
          }}
          className="cursor-zoom-in overflow-x-auto p-4 outline-none transition-colors hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-ring [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full [&_svg]:!bg-transparent"
          title="点击放大预览"
          aria-label="点击放大预览 Mermaid 图表"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </figure>

      {previewDialog}
    </>
  )
}
