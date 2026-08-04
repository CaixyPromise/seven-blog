"use client"

import { useId, useState } from "react"
import { Braces, Check, ChevronDown, Code2, Copy, FileJson, Terminal } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/components/public/blog/clipboard"
import { appendContentLicenseNotice, formatCodeFence } from "@/components/public/blog/markdown-copy"
import { getCopyFeedbackLabel, useCopyFeedback } from "@/components/public/blog/use-copy-feedback"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  title?: string
  caption?: string
  highlightLines?: Set<number>
}

const collapsedLineLimit = 16

export function CodeBlock({ code, language, filename, title, caption, highlightLines = new Set() }: CodeBlockProps) {
  const reactId = useId()
  const [expanded, setExpanded] = useState(false)
  const copyFeedback = useCopyFeedback({ successMessage: "已复制 Markdown 代码块" })
  const lines = code.split("\n")
  const shouldCollapse = lines.length > collapsedLineLimit
  const visibleLines = shouldCollapse && !expanded ? lines.slice(0, collapsedLineLimit) : lines

  async function handleCopy() {
    const markdown = formatCodeFence(code, language, { filename, title, caption })
    await copyFeedback.copy(appendContentLicenseNotice(markdown, { sourceUrl: window.location.href }))
  }

  async function handleCopyLine(line: string, lineNumber: number) {
    await copyToClipboard(line)
    const hash = `${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}-L${lineNumber}`
    window.history.replaceState(null, "", `#${hash}`)
    toast.success(`已复制第 ${lineNumber} 行`, {
      description: "地址栏已更新为该行锚点。",
    })
  }

  const LanguageIcon = getLanguageIcon(language)

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-border/60 bg-card/80">
      <figcaption className="flex min-h-10 items-center justify-between gap-3 border-b border-border/50 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <LanguageIcon className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <span className="block truncate font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {title || filename || language || "text"}
            </span>
            {(filename || title) && language ? (
              <span className="font-mono text-[10px] text-muted-foreground/70">{filename ? `${filename} · ${language}` : language}</span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {shouldCollapse ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border border-border/60 px-2.5 font-mono text-xs text-muted-foreground transition-colors",
                "hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
              )}
              title={expanded ? "收起代码" : "展开代码"}
              aria-label={expanded ? "收起代码" : "展开代码"}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
              {expanded ? "收起" : `展开 ${lines.length} 行`}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md border border-border/60 px-2.5 font-mono text-xs text-muted-foreground transition-colors",
              "hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
            )}
            title="复制 Markdown 代码块"
            aria-label="复制 Markdown 代码块"
          >
            {copyFeedback.isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {getCopyFeedbackLabel(copyFeedback.status)}
          </button>
        </div>
      </figcaption>
      <div className="relative">
        <pre className="m-0 overflow-x-auto p-0 text-sm leading-7">
          <code className={language ? `language-${language}` : undefined}>
            {visibleLines.map((line, index) => {
              const lineNumber = index + 1
              const isDiffAdd = line.startsWith("+") && !line.startsWith("+++")
              const isDiffRemove = line.startsWith("-") && !line.startsWith("---")
              const isHighlighted = highlightLines.has(lineNumber)

              return (
                <span
                  key={lineNumber}
                  id={`${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}-L${lineNumber}`}
                  className={cn(
                    "grid min-w-full grid-cols-[3.5rem_1fr] px-4",
                    isHighlighted && "bg-primary/10",
                    isDiffAdd && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
                    isDiffRemove && "bg-red-500/10 text-red-600 dark:text-red-300",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleCopyLine(line, lineNumber)}
                    className="sticky left-0 z-10 select-none bg-card/95 pr-4 text-right font-mono text-xs text-muted-foreground/60 transition-colors hover:text-primary"
                    title={`复制第 ${lineNumber} 行`}
                    aria-label={`复制第 ${lineNumber} 行`}
                  >
                    {lineNumber}
                  </button>
                  <span className="whitespace-pre">{line || " "}</span>
                </span>
              )
            })}
          </code>
        </pre>
        {shouldCollapse && !expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/95 to-transparent" />
        ) : null}
      </div>
      {shouldCollapse && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            "flex w-full items-center justify-center gap-2 border-t border-border/50 bg-card/70 px-4 py-2 font-mono text-xs text-muted-foreground transition-colors",
            "hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
          title="展开完整代码"
          aria-label="展开完整代码"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          展开剩余 {lines.length - collapsedLineLimit} 行
        </button>
      ) : null}
      {caption ? (
        <figcaption className="border-t border-border/50 px-4 py-2 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  )
}

function getLanguageIcon(language?: string) {
  switch (language?.toLowerCase()) {
    case "bash":
    case "shell":
    case "sh":
    case "zsh":
      return Terminal
    case "json":
      return FileJson
    case "tsx":
    case "ts":
    case "typescript":
    case "jsx":
    case "js":
    case "javascript":
      return Braces
    default:
      return Code2
  }
}
