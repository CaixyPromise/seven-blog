export interface MarkdownHeading {
  id: string
  depth: number
  text: string
}

export interface CodeMeta {
  filename?: string
  title?: string
  caption?: string
  highlightLines: Set<number>
}

export type MarkdownContentKind = "posts" | "notes"

export function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function extractMarkdownHeadings(content: string, minDepth = 2, maxDepth = 3): MarkdownHeading[] {
  const used = new Map<string, number>()
  const headings: MarkdownHeading[] = []
  let inFence = false

  for (const line of content.split("\n")) {
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence
      continue
    }

    if (inFence) {
      continue
    }

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) {
      continue
    }

    const depth = match[1].length
    if (depth < minDepth || depth > maxDepth) {
      continue
    }

    const text = stripMarkdownInline(match[2])
    const baseId = slugifyHeading(text) || `heading-${headings.length + 1}`
    const count = used.get(baseId) ?? 0
    used.set(baseId, count + 1)

    headings.push({
      id: count > 0 ? `${baseId}-${count + 1}` : baseId,
      depth,
      text,
    })
  }

  return headings
}

export function createHeadingIdFactory() {
  const used = new Map<string, number>()

  return (childrenText: string) => {
    const baseId = slugifyHeading(childrenText) || "heading"
    const count = used.get(baseId) ?? 0
    used.set(baseId, count + 1)
    return count > 0 ? `${baseId}-${count + 1}` : baseId
  }
}

export function extractTextFromReactNode(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(extractTextFromReactNode).join("")
  }

  if (value && typeof value === "object" && "props" in value) {
    const props = (value as { props?: { children?: unknown } }).props
    return extractTextFromReactNode(props?.children)
  }

  return ""
}

export function parseCodeMeta(meta?: string): CodeMeta {
  const highlightLines = new Set<number>()
  if (!meta) {
    return { highlightLines }
  }

  const filename = /(?:^|\s)filename=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(meta)?.slice(1).find(Boolean)
  const title = /(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(meta)?.slice(1).find(Boolean)
  const caption = /(?:^|\s)caption=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(meta)?.slice(1).find(Boolean)
  const highlight = /\{([^}]+)\}/.exec(meta)?.[1]

  if (highlight) {
    for (const part of highlight.split(",")) {
      const trimmed = part.trim()
      const range = /^(\d+)-(\d+)$/.exec(trimmed)
      if (range) {
        const start = Number(range[1])
        const end = Number(range[2])
        for (let line = start; line <= end; line += 1) {
          highlightLines.add(line)
        }
        continue
      }

      const line = Number(trimmed)
      if (Number.isInteger(line) && line > 0) {
        highlightLines.add(line)
      }
    }
  }

  return { filename, title, caption, highlightLines }
}

export function createCodeMetaResolver(content: string) {
  const metaBySignature = new Map<string, CodeMeta[]>()
  const fencePattern = /^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n\1\s*$/gm

  for (const match of content.matchAll(fencePattern)) {
    const info = match[2].trim()
    if (!info) {
      continue
    }

    const [language = "", ...metaParts] = info.split(/\s+/)
    const meta = parseCodeMeta(metaParts.join(" "))
    const code = match[3].replace(/\n$/, "")
    const signature = getCodeSignature(code, language)
    const queue = metaBySignature.get(signature) ?? []
    queue.push(meta)
    metaBySignature.set(signature, queue)
  }

  return (code: string, language?: string, fallbackMeta?: string): CodeMeta => {
    const signature = getCodeSignature(code, language)
    const queue = metaBySignature.get(signature)
    if (queue?.length) {
      return queue.shift() ?? parseCodeMeta(fallbackMeta)
    }

    return parseCodeMeta(fallbackMeta)
  }
}

export function resolveMarkdownImageSrc(
  src: string | undefined,
  slug?: string,
  contentKind: MarkdownContentKind = "posts",
) {
  if (!src || !slug || isAbsoluteImageSrc(src) || src.startsWith("/")) {
    return src
  }

  const normalized = src.replace(/^\.\//, "").replace(/^\/+/, "")
  return `/content-assets/${contentKind}/${encodeURIComponent(slug)}/${normalized}`
}

export function extractMarkdownImageSources(
  content: string,
  slug?: string,
  contentKind: MarkdownContentKind = "posts",
) {
  const sources = new Set<string>()
  const markdownImagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g
  const htmlImagePattern = /<img\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)')[^>]*>/gi

  for (const match of content.matchAll(markdownImagePattern)) {
    const src = resolveMarkdownImageSrc(match[1], slug, contentKind)
    if (src) {
      sources.add(src)
    }
  }

  for (const match of content.matchAll(htmlImagePattern)) {
    const src = resolveMarkdownImageSrc(match[1] || match[2], slug, contentKind)
    if (src) {
      sources.add(src)
    }
  }

  return Array.from(sources)
}

function stripMarkdownInline(value: string) {
  return value
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function isAbsoluteImageSrc(src: string) {
  return /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")
}

function getCodeSignature(code: string, language = "") {
  return `${language.toLowerCase()}::${code.trimEnd()}`
}
