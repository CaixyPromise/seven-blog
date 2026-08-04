import { apiSource } from "./api-source"
import { fileSource } from "./file-source"
import type { ContentSource } from "./types"

export function getContentSource(): ContentSource {
  if (!isFileContentSource()) {
    return apiSource
  }

  return fileSource
}

export function isFileContentSource(): boolean {
  return process.env.CONTENT_SOURCE !== "api" && !process.env.CONTENT_API_BASE_URL
}
