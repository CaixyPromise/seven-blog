"use client"

import { useState } from "react"
import { toast } from "sonner"
import { copyToClipboard } from "@/components/public/blog/clipboard"

export type CopyFeedbackStatus = "idle" | "copying" | "copied" | "failed"

interface CopyFeedbackOptions {
  successMessage: string
  failureMessage?: string
  description?: string
  resetMs?: number
}

export function useCopyFeedback({
  successMessage,
  failureMessage = "复制失败",
  description,
  resetMs = 1200,
}: CopyFeedbackOptions) {
  const [status, setStatus] = useState<CopyFeedbackStatus>("idle")

  async function copy(value: string) {
    setStatus("copying")

    try {
      await copyToClipboard(value)
      setStatus("copied")
      toast.success(successMessage, description ? { description } : undefined)
    } catch (error) {
      setStatus("failed")
      toast.error(failureMessage, {
        description: error instanceof Error ? error.message : "浏览器拒绝了剪贴板写入。",
      })
    } finally {
      window.setTimeout(() => setStatus("idle"), resetMs)
    }
  }

  return {
    status,
    copy,
    isCopying: status === "copying",
    isCopied: status === "copied",
    isFailed: status === "failed",
  }
}

export function getCopyFeedbackLabel(status: CopyFeedbackStatus, idle = "复制") {
  if (status === "copying") {
    return "复制中"
  }
  if (status === "copied") {
    return "已复制"
  }
  if (status === "failed") {
    return "复制失败"
  }
  return idle
}
