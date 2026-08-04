"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { copyToClipboard } from "@/components/public/blog/clipboard"
import { appendContentLicenseNotice, formatMathSource } from "@/components/public/blog/markdown-copy"

interface MathCopyEnhancerProps {
  rootId: string
}

const enhancedAttribute = "data-math-copy-enhanced"
const wrapperAttribute = "data-math-copy-wrapper"

export function MathCopyEnhancer({ rootId }: MathCopyEnhancerProps) {
  useEffect(() => {
    const root = document.getElementById(rootId)

    if (!root) {
      return
    }

    const cleanupCallbacks: Array<() => void> = []

    root.querySelectorAll<HTMLElement>(".katex-display").forEach((display) => {
      if (display.getAttribute(enhancedAttribute) === "true") {
        return
      }

      const tex = getTexSource(display)

      if (!tex) {
        return
      }

      const wrapper = document.createElement("span")
      wrapper.setAttribute(wrapperAttribute, "true")
      wrapper.className = "math-copy-container relative my-8 block"
      display.parentNode?.insertBefore(wrapper, display)
      wrapper.appendChild(display)

      display.setAttribute(enhancedAttribute, "true")
      display.classList.add("rounded-xl", "border", "border-border/40", "bg-card/30", "px-4", "py-6", "pr-20")

      const button = createCopyButton({
        label: "复制公式",
        className:
          "math-copy-button absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-background/90 px-2.5 font-mono text-xs text-muted-foreground shadow-sm transition hover:border-primary/60 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        text: "复制",
        tex,
        displayMode: "block",
      })
      const cleanupReveal = installTouchReveal(wrapper, button)

      wrapper.appendChild(button)
      cleanupCallbacks.push(() => {
        cleanupReveal()
        button.remove()
        wrapper.parentNode?.insertBefore(display, wrapper)
        wrapper.remove()
        display.removeAttribute(enhancedAttribute)
        display.classList.remove("rounded-xl", "border", "border-border/40", "bg-card/30", "px-4", "py-6", "pr-20")
      })
    })

    root.querySelectorAll<HTMLElement>(".katex").forEach((math) => {
      if (math.closest(".katex-display")) {
        return
      }

      if (math.getAttribute(enhancedAttribute) === "true") {
        return
      }

      const tex = getTexSource(math)

      if (!tex) {
        return
      }

      math.setAttribute(enhancedAttribute, "true")
      math.classList.add("math-copy-container", "relative", "inline-flex", "items-baseline", "gap-1")

      const button = createCopyButton({
        label: "复制行内公式",
        className:
          "math-copy-button inline-flex h-5 translate-y-0.5 items-center rounded border border-border/50 bg-background/80 px-1 font-mono text-[10px] leading-none text-muted-foreground/80 transition hover:border-primary/60 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        text: "copy",
        tex,
        displayMode: "inline",
      })
      const cleanupReveal = installTouchReveal(math, button)

      math.appendChild(button)
      cleanupCallbacks.push(() => {
        cleanupReveal()
        button.remove()
        math.removeAttribute(enhancedAttribute)
        math.classList.remove("math-copy-container", "relative", "inline-flex", "items-baseline", "gap-1")
      })
    })

    return () => {
      cleanupCallbacks.forEach((cleanup) => cleanup())
    }
  }, [rootId])

  return null
}

function getTexSource(element: HTMLElement) {
  const annotation = element.querySelector<HTMLElement>("annotation[encoding='application/x-tex']")
  return annotation?.textContent?.trim() ?? ""
}

function createCopyButton({
  label,
  className,
  text,
  tex,
  displayMode,
}: {
  label: string
  className: string
  text: string
  tex: string
  displayMode: "inline" | "block"
}) {
  const button = document.createElement("button")
  const pendingText = text === "copy" ? "..." : "复制中"
  const successText = text === "copy" ? "ok" : "已复制"
  const failedText = text === "copy" ? "fail" : "复制失败"
  let feedbackTimer: number | undefined

  function scheduleFeedbackReset() {
    if (feedbackTimer) {
      window.clearTimeout(feedbackTimer)
    }

    feedbackTimer = window.setTimeout(() => {
      resetCopyButton(button)
    }, 1200)
  }

  button.type = "button"
  button.className = className
  button.textContent = text
  button.title = label
  button.dataset.mathCopyButton = "true"
  button.dataset.defaultText = text
  button.setAttribute("aria-label", label)
  button.addEventListener("click", async (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (feedbackTimer) {
      window.clearTimeout(feedbackTimer)
    }
    button.dataset.mathCopyState = "clicked"
    button.textContent = pendingText

    try {
      const markdown = formatMathSource(tex, displayMode)
      await copyToClipboard(appendContentLicenseNotice(markdown, { sourceUrl: window.location.href }))
      button.dataset.mathCopyState = "copied"
      button.textContent = successText
      scheduleFeedbackReset()
      toast.success("已复制 Markdown 公式")
    } catch (error) {
      button.dataset.mathCopyState = "failed"
      button.textContent = failedText
      scheduleFeedbackReset()
      toast.error("复制公式失败", {
        description: error instanceof Error ? error.message : "浏览器拒绝了剪贴板写入。",
      })
    }
  })

  return button
}

function installTouchReveal(container: HTMLElement, button: HTMLElement) {
  function show() {
    container.classList.add("math-copy-visible")
  }

  function hide() {
    if (container.matches(":hover") || container.contains(document.activeElement)) {
      return
    }

    resetCopyButton(button)
    container.classList.remove("math-copy-visible")
  }

  function hideWhenTouchingOutside(event: PointerEvent) {
    if (container.contains(event.target as Node)) {
      return
    }

    resetCopyButton(button)
    container.classList.remove("math-copy-visible")
  }

  container.addEventListener("pointerdown", show)
  container.addEventListener("pointerenter", show)
  container.addEventListener("pointerleave", hide)
  button.addEventListener("focus", show)
  button.addEventListener("blur", hide)
  document.addEventListener("pointerdown", hideWhenTouchingOutside)

  return () => {
    container.removeEventListener("pointerdown", show)
    container.removeEventListener("pointerenter", show)
    container.removeEventListener("pointerleave", hide)
    button.removeEventListener("focus", show)
    button.removeEventListener("blur", hide)
    document.removeEventListener("pointerdown", hideWhenTouchingOutside)
  }
}

function resetCopyButton(button: HTMLElement) {
  button.dataset.mathCopyState = ""
  button.textContent = button.dataset.defaultText ?? "复制"
}
