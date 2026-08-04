export interface MarkdownTocItem {
  id: string
  depth: number
  text: string
}

export function extractMarkdownToc(content: string, minDepth = 2, maxDepth = 3): MarkdownTocItem[] {
  const used = new Map<string, number>()
  const items: MarkdownTocItem[] = []
  let inFence = false

  for (const line of content.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
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

    const text = stripInlineMarkdown(match[2])
    const baseId = slugify(text) || `heading-${items.length + 1}`
    const count = used.get(baseId) ?? 0
    used.set(baseId, count + 1)
    items.push({ id: count > 0 ? `${baseId}-${count + 1}` : baseId, depth, text })
  }

  return items
}

export function renderMarkdownToc(content: string, baseUrl?: string) {
  const toc = extractMarkdownToc(content)
  if (toc.length === 0) {
    return "No table of contents available."
  }

  return toc
    .map((item) => {
      const indent = "  ".repeat(Math.max(0, item.depth - 2))
      const href = baseUrl ? `${baseUrl}#${item.id}` : `#${item.id}`
      return `${indent}- [${item.text}](${href})`
    })
    .join("\n")
}

export function absolutizeMarkdownAssetLinks(content: string, pageUrl: string, assetBaseUrl: string) {
  return content.replace(/(!\[[^\]]*]\()([^)\\s]+)([^)]*\))/g, (full, prefix: string, src: string, suffix: string) => {
    if (isAbsolute(src) || src.startsWith("/")) {
      return `${prefix}${new URL(src, pageUrl).toString()}${suffix}`
    }

    if (src.startsWith("./") || src.startsWith("../")) {
      const normalized = src.replace(/^\.\//, "")
      return `${prefix}${assetBaseUrl.replace(/\/$/, "")}/${normalized}${suffix}`
    }

    return full
  })
}

function stripInlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function isAbsolute(src: string) {
  return /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(src) || src.startsWith("data:")
}
