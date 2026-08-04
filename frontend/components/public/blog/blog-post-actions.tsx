"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Bookmark, ChevronUp, FileText, Link2, Twitter } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatArticleMarkdown } from "@/components/public/blog/markdown-copy"
import { useCopyFeedback } from "@/components/public/blog/use-copy-feedback"
import { cn } from "@/lib/utils"

interface BlogPostActionsProps {
  title: string
  excerpt: string
  markdownContent?: string
  variant: "desktop" | "mobile"
}

export function BlogPostActions({ title, excerpt, markdownContent, variant }: BlogPostActionsProps) {
  const [mounted, setMounted] = useState(false)
  const copyFeedback = useCopyFeedback({
    successMessage: "已复制分享内容",
    description: "包含网站名称、文章标题、摘要和链接。",
    resetMs: 1600,
  })
  const markdownCopyFeedback = useCopyFeedback({
    successMessage: "已复制 Markdown 正文",
    description: "包含标题、摘要和文章正文。",
    resetMs: 1600,
  })
  const [canCopy, setCanCopy] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [canBookmark, setCanBookmark] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCanCopy(Boolean(navigator.clipboard?.writeText) || window.isSecureContext)
    setCanShare(typeof navigator.share === "function")
    setCanBookmark(typeof window.external !== "undefined" && "AddFavorite" in window.external)

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`,
      "_blank",
    )
  }

  const copyLink = async () => {
    await copyFeedback.copy(getShareText())
  }

  const copyMarkdown = async () => {
    if (!markdownContent) {
      return
    }

    await markdownCopyFeedback.copy(formatArticleMarkdown(title, excerpt, markdownContent, window.location.href))
  }

  const nativeShare = async () => {
    if (!navigator.share) {
      return
    }
    await navigator.share({
      title,
      text: `${excerpt}\n\nCaixyPromise Blog`,
      url: window.location.href,
    })
  }

  const addBookmark = () => {
    const external = window.external as unknown as { AddFavorite?: (url: string, title: string) => void }
    if (external?.AddFavorite) {
      external.AddFavorite(window.location.href, `${title} | CaixyPromise Blog`)
      toast.success("已请求添加收藏")
      return
    }
    toast.info("当前浏览器不支持网页直接添加收藏", {
      description: "可以使用浏览器菜单或快捷键保存当前页面。",
    })
  }

  function getShareText() {
    return `${title} - CaixyPromise Blog\n${excerpt}\n\n${window.location.href}`
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const iconClassName =
    variant === "desktop"
      ? "h-10 w-10 rounded-lg border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-transparent"
      : "h-9 w-9 rounded-lg border-border/50 bg-transparent"

  const scrollTopButton =
    mounted && variant === "desktop"
      ? createPortal(
          <button
            onClick={scrollToTop}
            className={cn(
              "fixed bottom-6 right-6 z-50 flex h-14 w-14 flex-col items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground glass backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card hover:text-primary",
              showScrollTop ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4",
            )}
            aria-label="返回顶部"
            title="返回顶部"
          >
            <ChevronUp className="h-4 w-4" />
            <span className="font-mono text-[10px] leading-none">TOP</span>
          </button>,
          document.body,
        )
      : null

  return (
    <>
      <div className={variant === "desktop" ? "sticky top-32 flex flex-col gap-3" : "flex items-center gap-4"}>
        {variant === "desktop" ? (
          <span className="font-mono text-xs text-muted-foreground mb-2 text-center">share</span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">share:</span>
        )}
        {canShare ? (
          <Button variant="outline" size="icon" className={iconClassName} onClick={nativeShare}>
            <Link2 className="h-4 w-4" />
            <span className="sr-only">系统分享</span>
          </Button>
        ) : null}
        <Button variant="outline" size="icon" className={iconClassName} onClick={shareToTwitter}>
          <Twitter className="h-4 w-4" />
          <span className="sr-only">Share on Twitter</span>
        </Button>
        {canCopy ? (
          <>
            <Button
              variant="outline"
              size="icon"
              className={cn(iconClassName, copyFeedback.isCopied && "border-primary/60 bg-primary/15 text-primary")}
              onClick={copyLink}
              title={copyFeedback.isCopied ? "已复制分享内容" : "复制分享内容"}
            >
              <Link2 className={cn("h-4 w-4 transition-transform", copyFeedback.isCopied && "scale-110")} />
              <span className="sr-only">{copyFeedback.isCopied ? "已复制分享内容" : "复制分享内容"}</span>
            </Button>
            {markdownContent ? (
              <Button
                variant="outline"
                size="icon"
                className={cn(iconClassName, markdownCopyFeedback.isCopied && "border-primary/60 bg-primary/15 text-primary")}
                onClick={copyMarkdown}
                title={markdownCopyFeedback.isCopied ? "已复制 Markdown 正文" : "复制全文 Markdown"}
              >
                <FileText className={cn("h-4 w-4 transition-transform", markdownCopyFeedback.isCopied && "scale-110")} />
                <span className="sr-only">
                  {markdownCopyFeedback.isCopied ? "已复制 Markdown 正文" : "复制全文 Markdown"}
                </span>
              </Button>
            ) : null}
          </>
        ) : null}
        {mounted && canBookmark ? (
          <Button variant="outline" size="icon" className={iconClassName} onClick={addBookmark} title="添加到浏览器收藏夹">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">添加到浏览器收藏夹</span>
          </Button>
        ) : null}
      </div>

      {scrollTopButton}
    </>
  )
}
