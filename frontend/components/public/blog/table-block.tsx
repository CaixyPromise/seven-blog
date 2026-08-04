"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { appendContentLicenseNotice, formatMarkdownTable } from "@/components/public/blog/markdown-copy"
import { getCopyFeedbackLabel, useCopyFeedback } from "@/components/public/blog/use-copy-feedback"

interface TableBlockProps {
  children: ReactNode
}

interface StickyHeaderLayout {
  active: boolean
  left: number
  top: number
  width: number
  tableWidth: number
  scrollLeft: number
  headerHtml: string
  columnWidths: number[]
}

const stickyHeaderTop = 80

export function TableBlock({ children }: TableBlockProps) {
  const tableRef = useRef<HTMLTableElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [stickyHeader, setStickyHeader] = useState<StickyHeaderLayout>({
    active: false,
    left: 0,
    top: stickyHeaderTop,
    width: 0,
    tableWidth: 0,
    scrollLeft: 0,
    headerHtml: "",
    columnWidths: [],
  })
  const copyFeedback = useCopyFeedback({ successMessage: "已复制 Markdown 表格" })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const table = tableRef.current
    const scroller = scrollerRef.current
    const thead = table?.querySelector("thead")

    if (!table || !scroller || !thead) {
      return
    }

    const updateStickyHeader = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }

      frameRef.current = requestAnimationFrame(() => {
        const nextTable = tableRef.current
        const nextScroller = scrollerRef.current
        const nextThead = nextTable?.querySelector("thead")

        if (!nextTable || !nextScroller || !nextThead) {
          setStickyHeader((value) => ({ ...value, active: false }))
          return
        }

        const tableRect = nextTable.getBoundingClientRect()
        const scrollerRect = nextScroller.getBoundingClientRect()
        const headerRect = nextThead.getBoundingClientRect()
        const active = tableRect.top < stickyHeaderTop && tableRect.bottom > stickyHeaderTop + headerRect.height
        const firstRowCells = Array.from(nextThead.querySelectorAll<HTMLTableCellElement>("tr:first-child > th, tr:first-child > td"))

        setStickyHeader({
          active,
          left: scrollerRect.left,
          top: stickyHeaderTop,
          width: scrollerRect.width,
          tableWidth: tableRect.width,
          scrollLeft: nextScroller.scrollLeft,
          headerHtml: nextThead.innerHTML,
          columnWidths: firstRowCells.map((cell) => cell.getBoundingClientRect().width),
        })
      })
    }

    updateStickyHeader()

    window.addEventListener("scroll", updateStickyHeader, { passive: true })
    window.addEventListener("resize", updateStickyHeader)
    scroller.addEventListener("scroll", updateStickyHeader, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateStickyHeader)
      window.removeEventListener("resize", updateStickyHeader)
      scroller.removeEventListener("scroll", updateStickyHeader)
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [children])

  async function handleCopy() {
    const rows = Array.from(tableRef.current?.querySelectorAll("tr") ?? [])
    const value = appendContentLicenseNotice(formatMarkdownTable(rows), { sourceUrl: window.location.href })

    if (!value) {
      return
    }

    await copyFeedback.copy(value)
  }

  return (
    <figure className="not-prose my-8 overflow-visible rounded-xl border border-border/60 bg-card/60">
      <figcaption className="flex min-h-10 items-center justify-between gap-3 rounded-t-xl border-b border-border/50 bg-card/95 px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">table</span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border border-border/60 px-2.5 font-mono text-xs text-muted-foreground transition-colors",
            "hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
          )}
          title="复制 Markdown 表格"
          aria-label="复制 Markdown 表格"
        >
          {copyFeedback.isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {getCopyFeedbackLabel(copyFeedback.status)}
        </button>
      </figcaption>
      <div ref={scrollerRef} className="overflow-x-auto rounded-b-xl">
        <table ref={tableRef} className="w-full border-collapse text-left text-base">
          {children}
        </table>
      </div>
      {mounted && stickyHeader.active
        ? createPortal(
            <div
              className="pointer-events-none fixed z-40 overflow-hidden border-x border-border/60 shadow-sm"
              style={{
                left: stickyHeader.left,
                top: stickyHeader.top,
                width: stickyHeader.width,
              }}
              aria-hidden="true"
            >
              <table
                className="border-collapse text-left text-base"
                style={{
                  width: stickyHeader.tableWidth,
                  transform: `translateX(-${stickyHeader.scrollLeft}px)`,
                }}
              >
                <colgroup>
                  {stickyHeader.columnWidths.map((width, index) => (
                    <col key={index} style={{ width }} />
                  ))}
                </colgroup>
                <thead dangerouslySetInnerHTML={{ __html: stickyHeader.headerHtml }} />
              </table>
            </div>,
            document.body,
          )
        : null}
    </figure>
  )
}
