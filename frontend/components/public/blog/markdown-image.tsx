"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react"

interface MarkdownImageProps {
  src?: string
  alt?: string
  title?: string
  gallery?: string[]
  initialIndex?: number
}

interface ImageMeta {
  caption?: string
  source?: string
  width?: number
  height?: number
}

export function MarkdownImage({ src, alt = "", title, gallery = [], initialIndex = 0 }: MarkdownImageProps) {
  const [error, setError] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const imageMeta = parseImageTitle(title)
  const activeSrc = gallery[activeIndex] ?? src
  const hasGallery = gallery.length > 1
  const allowedRemote = isAllowedImageSrc(src)

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
      if (event.key === "ArrowLeft") {
        showPreviousImage()
      }
      if (event.key === "ArrowRight") {
        showNextImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [previewOpen])

  if (!src || error || !allowedRemote) {
    return (
      <figure className="not-prose my-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
        <div className="flex items-center gap-2 font-mono">
          <ImageOff className="h-4 w-4" />
          <span>{allowedRemote ? "图片加载失败" : "远程图片域名不在白名单内"}</span>
        </div>
        {src ? <figcaption className="mt-2 break-all text-xs opacity-80">{src}</figcaption> : null}
      </figure>
    )
  }

  function openPreview() {
    setZoom(1)
    setActiveIndex(Math.max(0, initialIndex))
    setPreviewOpen(true)
  }

  function showPreviousImage() {
    setZoom(1)
    setActiveIndex((value) => (value - 1 + gallery.length) % gallery.length)
  }

  function showNextImage() {
    setZoom(1)
    setActiveIndex((value) => (value + 1) % gallery.length)
  }

  const previewDialog = previewOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <span className="min-w-0 truncate font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {alt || imageMeta.caption || "image preview"}
              {hasGallery ? ` · ${activeIndex + 1}/${gallery.length}` : ""}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(0.25, Number((value - 0.1).toFixed(2))))}
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
                onClick={() => setZoom((value) => Math.min(4, Number((value + 0.1).toFixed(2))))}
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
            <div className="relative flex min-h-full min-w-full items-center justify-center">
              {hasGallery ? (
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="fixed left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                  title="上一张"
                  aria-label="上一张"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : null}
              <img
                src={activeSrc}
                alt={alt}
                title={imageMeta.caption}
                loading="lazy"
                decoding="async"
                className="max-w-none origin-center rounded-lg"
                style={{ transform: `scale(${zoom})` }}
              />
              {hasGallery ? (
                <button
                  type="button"
                  onClick={showNextImage}
                  className="fixed right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                  title="下一张"
                  aria-label="下一张"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>
          {hasGallery ? (
            <div className="flex gap-2 overflow-x-auto border-t border-border/60 px-4 py-3">
              {gallery.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => {
                    setZoom(1)
                    setActiveIndex(index)
                  }}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border transition-colors ${
                    index === activeIndex ? "border-primary" : "border-border/60 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`查看第 ${index + 1} 张图片`}
                >
                  <img src={item} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ) : null}
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <figure className="not-prose my-8 overflow-hidden rounded-xl border border-border/60 bg-card/60">
        <button
          type="button"
          onClick={openPreview}
          className="group relative block w-full cursor-zoom-in overflow-hidden bg-secondary/20 text-left"
          title="点击放大预览"
          aria-label="点击放大预览图片"
        >
          <img
            src={src}
            alt={alt}
            title={imageMeta.caption}
            onError={() => setError(true)}
            loading="lazy"
            decoding="async"
            className="mx-auto block max-h-[640px] min-h-40 w-full object-contain"
            style={{
              maxWidth: imageMeta.width ? `${imageMeta.width}px` : undefined,
              aspectRatio: imageMeta.width && imageMeta.height ? `${imageMeta.width} / ${imageMeta.height}` : undefined,
            }}
          />
          <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </span>
        </button>
        {alt || imageMeta.caption || imageMeta.source ? (
          <figcaption className="border-t border-border/50 px-4 py-2 text-sm text-muted-foreground">
            <span>{imageMeta.caption || alt}</span>
            {imageMeta.source ? (
              <span className="ml-2 font-mono text-xs text-muted-foreground/70">source: {imageMeta.source}</span>
            ) : null}
          </figcaption>
        ) : null}
        {!alt ? (
          <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-2 font-mono text-xs text-amber-600 dark:text-amber-300">
            缺少 alt 文本，建议补充图片说明。
          </div>
        ) : null}
      </figure>

      {previewDialog}
    </>
  )
}

function isAllowedImageSrc(src?: string) {
  if (!src || src.startsWith("/") || src.startsWith("./") || src.startsWith("../") || src.startsWith("data:image/")) {
    return true
  }

  try {
    const url = new URL(src)
    const configuredHosts = (process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS ?? "")
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean)
    const allowedHosts = new Set([
      "github.com",
      "raw.githubusercontent.com",
      "user-images.githubusercontent.com",
      "images.unsplash.com",
      ...configuredHosts,
    ])
    return allowedHosts.has(url.hostname)
  } catch {
    return true
  }
}

function parseImageTitle(title?: string): ImageMeta {
  if (!title) {
    return {}
  }

  const parts = title
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
  const meta: ImageMeta = {}

  for (const part of parts) {
    const source = /^source\s*:\s*(.+)$/i.exec(part)
    if (source) {
      meta.source = source[1].trim()
      continue
    }

    const width = /^width\s*=\s*(\d+)$/i.exec(part)
    if (width) {
      meta.width = Number(width[1])
      continue
    }

    const height = /^height\s*=\s*(\d+)$/i.exec(part)
    if (height) {
      meta.height = Number(height[1])
      continue
    }

    meta.caption = meta.caption ? `${meta.caption} · ${part}` : part
  }

  return meta
}
