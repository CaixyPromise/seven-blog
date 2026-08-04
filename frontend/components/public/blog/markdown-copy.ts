export interface CodeFenceMeta {
  filename?: string
  title?: string
  caption?: string
}

export const contentLicense = {
  name: "CC BY-NC-SA 4.0",
  fullName: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International",
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
}

export const codeLicense = {
  name: "MIT",
  url: "https://opensource.org/license/mit",
}

export function formatArticleMarkdown(title: string, excerpt: string, content: string, sourceUrl?: string) {
  const sections = [`# ${title.trim()}`]
  const normalizedExcerpt = excerpt.trim()
  const normalizedContent = content.trim()

  if (normalizedExcerpt) {
    sections.push(`> ${normalizedExcerpt.replace(/\n+/g, " ")}`)
  }

  if (normalizedContent) {
    sections.push(normalizedContent)
  }

  return appendContentLicenseNotice(`${sections.join("\n\n")}\n`, { sourceUrl, force: true })
}

export function formatCodeFence(code: string, language?: string, meta: CodeFenceMeta = {}) {
  const fence = getSafeFence(code)
  const info = [language?.trim(), formatCodeFenceMeta(meta)].filter(Boolean).join(" ")

  return `${fence}${info ? info : ""}\n${code.trimEnd()}\n${fence}`
}

export function formatMermaidFence(chart: string) {
  return formatCodeFence(chart, "mermaid")
}

export function formatMathSource(tex: string, displayMode: "inline" | "block") {
  const normalized = tex.trim()

  if (displayMode === "inline") {
    return `$${normalized}$`
  }

  return `$$\n${normalized}\n$$`
}

export function formatMarkdownTable(rows: HTMLTableRowElement[]) {
  const matrix = rows
    .map((row) =>
      Array.from(row.querySelectorAll("th,td")).map((cell) => normalizeMarkdownTableCell(cell.textContent ?? "")),
    )
    .filter((cells) => cells.length > 0)

  if (matrix.length === 0) {
    return ""
  }

  const columnCount = Math.max(...matrix.map((cells) => cells.length))
  const normalizedRows = matrix.map((cells) => normalizeColumnCount(cells, columnCount))
  const [headerRow, ...bodyRows] = normalizedRows
  const dividerRow = Array.from({ length: columnCount }, () => "---")

  return [headerRow, dividerRow, ...bodyRows].map((cells) => `| ${cells.join(" | ")} |`).join("\n")
}

export function appendContentLicenseNotice(markdown: string, options: { sourceUrl?: string; force?: boolean } = {}) {
  const normalized = markdown.trimEnd()

  if (!normalized) {
    return ""
  }

  const lineCount = normalized.split(/\r?\n/).length

  if (!options.force && lineCount <= 10) {
    return markdown
  }

  return `${normalized}\n\n---\n\nSource: ${options.sourceUrl || "CaixyPromise Blog"}\nLicense: ${contentLicense.fullName} (${contentLicense.name})\nLicense URL: ${contentLicense.url}\nAllowed use: You may share and adapt this content for non-commercial purposes with attribution and under the same license.\n`
}

function formatCodeFenceMeta(meta: CodeFenceMeta) {
  return [
    formatMetaAttribute("filename", meta.filename),
    formatMetaAttribute("title", meta.title),
    formatMetaAttribute("caption", meta.caption),
  ]
    .filter(Boolean)
    .join(" ")
}

function formatMetaAttribute(key: string, value?: string) {
  const normalized = value?.trim()

  if (!normalized) {
    return ""
  }

  return `${key}="${normalized.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

function getSafeFence(code: string) {
  const matches = code.match(/`{3,}/g) ?? []
  const longest = matches.reduce((length, match) => Math.max(length, match.length), 2)

  return "`".repeat(longest + 1)
}

function normalizeMarkdownTableCell(value: string) {
  return value.trim().replace(/\s+/g, " ").replaceAll("|", "\\|")
}

function normalizeColumnCount(cells: string[], columnCount: number) {
  if (cells.length >= columnCount) {
    return cells
  }

  return [...cells, ...Array.from({ length: columnCount - cells.length }, () => "")]
}
