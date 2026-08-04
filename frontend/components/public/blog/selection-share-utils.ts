export interface SelectionAnchor {
  blockId: string
  start: number
  end: number
  hash: string
}

export interface SelectionShareParams {
  sel?: SelectionAnchor
  q?: string
}

const blockSelector = "[data-share-block-id]"
const highlightAttribute = "data-selection-share-highlight"
const cssHighlightName = "selection-share-highlight"
const blockTargets = "h1,h2,h3,h4,p,ul,ol,li,blockquote,td,th"
const ignoredSelector = "button,a,input,textarea,select,[role='button'],[data-selection-share-ignore]"

export function prepareSelectionShareBlocks(scopes: HTMLElement[]) {
  const used = new Map<string, number>()

  scopes.forEach((scope) => {
    const blocks = Array.from(scope.querySelectorAll<HTMLElement>(blockTargets))

    if (scope.matches(blockTargets)) {
      blocks.unshift(scope)
    }

    blocks.forEach((block) => {
      if (block.closest("[data-selection-share-ignore]")) {
        return
      }

      const text = normalizeBlockText(block.textContent ?? "")
      if (!text || text.length < 2) {
        return
      }

      const tag = block.tagName.toLowerCase()
      const baseId = `${tag}-${shortHash(text)}`
      const count = used.get(baseId) ?? 0
      used.set(baseId, count + 1)
      block.dataset.shareBlockId = count > 0 ? `${baseId}-${count + 1}` : baseId
      block.classList.add("selection-share-block")
    })
  })
}

export function createSelectionShareUrl(selection: Selection, scopes: HTMLElement[]) {
  const selectedText = normalizeSelectionText(selection.toString())
  if (selectedText.length < 2) {
    return undefined
  }

  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.delete("sel")
  currentUrl.searchParams.delete("q")

  const anchor = createSelectionAnchor(selection, scopes)
  if (anchor) {
    currentUrl.searchParams.set("sel", `${anchor.blockId}.${anchor.start}.${anchor.end}.${anchor.hash}`)
  }

  currentUrl.searchParams.set("q", createQuoteFallback(selectedText))
  currentUrl.hash = ""

  return currentUrl.toString()
}

export function getSelectionFloatingRect(selection: Selection) {
  if (selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)
  const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0)
  const rect = rects[0] ?? range.getBoundingClientRect()

  if (!rect || rect.width === 0 || rect.height === 0) {
    return null
  }

  const top = rect.top > 56 ? rect.top - 44 : rect.bottom + 10

  return {
    top: Math.min(window.innerHeight - 48, Math.max(12, top)),
    left: Math.min(window.innerWidth - 180, Math.max(12, rect.left + rect.width / 2 - 72)),
  }
}

export function parseSelectionShareParams(params: URLSearchParams): SelectionShareParams {
  const raw = params.get("sel") ?? undefined
  const q = params.get("q") ?? undefined
  const parsed = raw ? /^([a-z0-9-]+)\.(\d+)\.(\d+)\.([a-z0-9]+)$/i.exec(raw) : null

  if (!parsed) {
    return { q }
  }

  return {
    sel: {
      blockId: parsed[1],
      start: Number(parsed[2]),
      end: Number(parsed[3]),
      hash: parsed[4],
    },
    q,
  }
}

export function applySelectionHighlight(scopes: HTMLElement[], params: SelectionShareParams) {
  clearSelectionHighlights(scopes)

  if (params.sel && applyAnchorHighlight(scopes, params.sel)) {
    return true
  }

  if (params.q && applyQuoteHighlight(scopes, params.q)) {
    return true
  }

  return false
}

export function selectionIsInsideScopes(selection: Selection, scopes: HTMLElement[]) {
  if (selection.rangeCount === 0 || selection.isCollapsed) {
    return false
  }

  const range = selection.getRangeAt(0)
  return scopes.some((scope) => scope.contains(range.startContainer) && scope.contains(range.endContainer))
}

export function selectionStartsInIgnoredElement(selection: Selection) {
  if (selection.rangeCount === 0) {
    return true
  }

  const range = selection.getRangeAt(0)
  const startElement = getElementFromNode(range.startContainer)
  const endElement = getElementFromNode(range.endContainer)
  return Boolean(startElement?.closest(ignoredSelector) || endElement?.closest(ignoredSelector))
}

function createSelectionAnchor(selection: Selection, scopes: HTMLElement[]): SelectionAnchor | undefined {
  if (selection.rangeCount === 0) {
    return undefined
  }

  const range = selection.getRangeAt(0)
  const startElement = getElementFromNode(range.startContainer)
  const endElement = getElementFromNode(range.endContainer)
  const startBlock = startElement?.closest<HTMLElement>(blockSelector)
  const endBlock = endElement?.closest<HTMLElement>(blockSelector)
  const sharedBlock = getSharedSelectionBlock(startElement, endElement, startBlock, endBlock, scopes)

  if (!sharedBlock) {
    return undefined
  }

  const start = getTextOffset(sharedBlock, range.startContainer, range.startOffset)
  const end = getTextOffset(sharedBlock, range.endContainer, range.endOffset)
  const selected = sharedBlock.textContent?.slice(start, end) ?? ""
  const normalizedSelected = normalizeSelectionText(selected)

  if (start < 0 || end <= start || normalizedSelected.length < 2) {
    return undefined
  }

  return {
    blockId: sharedBlock.dataset.shareBlockId ?? "",
    start,
    end,
    hash: shortHash(normalizedSelected),
  }
}

function getSharedSelectionBlock(
  startElement: Element | null | undefined,
  endElement: Element | null | undefined,
  startBlock: HTMLElement | null | undefined,
  endBlock: HTMLElement | null | undefined,
  scopes: HTMLElement[],
) {
  if (!startElement || !endElement || !startBlock || !endBlock) {
    return undefined
  }

  const startChain = getBlockAncestorChain(startElement)
  const endChain = new Set(getBlockAncestorChain(endElement))
  const sharedBlock = startChain.find((block) => endChain.has(block))

  if (!sharedBlock || !scopes.some((scope) => scope.contains(sharedBlock) || scope === sharedBlock)) {
    return undefined
  }

  return sharedBlock
}

function getBlockAncestorChain(element: Element) {
  const chain: HTMLElement[] = []
  let current: Element | null = element

  while (current) {
    if (current instanceof HTMLElement && current.matches(blockSelector)) {
      chain.push(current)
    }
    current = current.parentElement
  }

  return chain
}

function applyAnchorHighlight(scopes: HTMLElement[], anchor: SelectionAnchor) {
  const block = scopes
    .flatMap((scope) => Array.from(scope.querySelectorAll<HTMLElement>(blockSelector)))
    .find((element) => element.dataset.shareBlockId === anchor.blockId)

  if (!block) {
    return false
  }

  const text = block.textContent ?? ""
  if (anchor.start < 0 || anchor.end > text.length || anchor.end <= anchor.start) {
    return false
  }

  const selected = normalizeSelectionText(text.slice(anchor.start, anchor.end))
  if (shortHash(selected) !== anchor.hash) {
    return false
  }

  return highlightTextRange(block, anchor.start, anchor.end)
}

function applyQuoteHighlight(scopes: HTMLElement[], quote: string) {
  const normalizedQuote = normalizeSelectionText(quote)
  if (normalizedQuote.length < 2) {
    return false
  }

  for (const block of scopes.flatMap((scope) => Array.from(scope.querySelectorAll<HTMLElement>(blockSelector)))) {
    const text = block.textContent ?? ""
    const range = findNormalizedTextRange(text, normalizedQuote)
    if (range && highlightTextRange(block, range.start, range.end)) {
      return true
    }
  }

  return false
}

function highlightTextRange(block: HTMLElement, start: number, end: number) {
  const range = createRangeFromTextOffsets(block, start, end)
  if (!range) {
    return false
  }

  if (applyCssHighlight(range)) {
    scrollRangeIntoView(range)
    return true
  }

  if (!canSafelyWrapRange(range)) {
    block.setAttribute(highlightAttribute, "true")
    block.classList.add("selection-share-block-highlight")
    block.scrollIntoView({ behavior: "smooth", block: "center" })
    return true
  }

  const mark = document.createElement("mark")
  mark.setAttribute(highlightAttribute, "true")
  mark.className = "rounded bg-amber-300/50 px-0.5 text-foreground ring-1 ring-amber-400/40 dark:bg-primary/25 dark:ring-primary/40"

  try {
    range.surroundContents(mark)
  } catch {
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
  }

  window.setTimeout(() => mark.scrollIntoView({ behavior: "smooth", block: "center" }), 50)

  return true
}

function clearSelectionHighlights(scopes: HTMLElement[]) {
  getCssHighlights()?.delete(cssHighlightName)
  scopes.forEach((scope) => {
    scope.querySelectorAll<HTMLElement>(`mark[${highlightAttribute}]`).forEach((mark) => {
      mark.replaceWith(...Array.from(mark.childNodes))
    })
    scope.querySelectorAll<HTMLElement>(`[${highlightAttribute}]`).forEach((element) => {
      element.removeAttribute(highlightAttribute)
      element.classList.remove("selection-share-block-highlight")
    })
  })
}

function applyCssHighlight(range: Range) {
  const highlights = getCssHighlights()
  const HighlightConstructor = getHighlightConstructor()

  if (!highlights || !HighlightConstructor) {
    return false
  }

  highlights.set(cssHighlightName, new HighlightConstructor(range))
  return true
}

function getCssHighlights() {
  return (CSS as unknown as { highlights?: Map<string, unknown> }).highlights
}

function getHighlightConstructor() {
  return (globalThis as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight
}

function canSafelyWrapRange(range: Range) {
  return range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE
}

function scrollRangeIntoView(range: Range) {
  const rect = range.getBoundingClientRect()

  if (rect.width === 0 && rect.height === 0) {
    return
  }

  window.scrollTo({
    top: window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2,
    behavior: "smooth",
  })
}

function createRangeFromTextOffsets(root: HTMLElement, start: number, end: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let currentOffset = 0
  let startSet = false

  while (walker.nextNode()) {
    const node = walker.currentNode
    const length = node.textContent?.length ?? 0
    const nextOffset = currentOffset + length

    if (!startSet && start >= currentOffset && start <= nextOffset) {
      range.setStart(node, start - currentOffset)
      startSet = true
    }

    if (startSet && end >= currentOffset && end <= nextOffset) {
      range.setEnd(node, end - currentOffset)
      return range
    }

    currentOffset = nextOffset
  }

  return null
}

function getTextOffset(root: HTMLElement, target: Node, offset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let currentOffset = 0

  while (walker.nextNode()) {
    const node = walker.currentNode
    const length = node.textContent?.length ?? 0

    if (node === target) {
      return currentOffset + offset
    }

    currentOffset += length
  }

  return -1
}

function createQuoteFallback(value: string) {
  return value.slice(0, 40)
}

function findNormalizedTextRange(source: string, needle: string) {
  const normalizedChars: string[] = []
  const originalOffsets: number[] = []
  let previousWasWhitespace = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const isWhitespace = /\s/.test(char)

    if (isWhitespace) {
      if (!previousWasWhitespace && normalizedChars.length > 0) {
        normalizedChars.push(" ")
        originalOffsets.push(index)
      }
      previousWasWhitespace = true
      continue
    }

    normalizedChars.push(char)
    originalOffsets.push(index)
    previousWasWhitespace = false
  }

  if (normalizedChars[normalizedChars.length - 1] === " ") {
    normalizedChars.pop()
    originalOffsets.pop()
  }

  const normalizedSource = normalizedChars.join("")
  const normalizedStart = normalizedSource.indexOf(needle)

  if (normalizedStart < 0) {
    return null
  }

  const normalizedEnd = normalizedStart + needle.length - 1
  return {
    start: originalOffsets[normalizedStart],
    end: (originalOffsets[normalizedEnd] ?? originalOffsets[normalizedStart]) + 1,
  }
}

function normalizeBlockText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function normalizeSelectionText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function getElementFromNode(node: Node) {
  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
}

function shortHash(value: string) {
  let hash = 5381

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }

  return (hash >>> 0).toString(36).slice(0, 6)
}
