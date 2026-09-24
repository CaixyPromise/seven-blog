import { Children, isValidElement, type ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { cn } from "@/lib/utils"
import { ArticleHeading } from "@/components/public/blog/article-heading"
import { CodeBlock } from "@/components/public/blog/code-block"
import { MarkdownImage } from "@/components/public/blog/markdown-image"
import { markdownSanitizeSchema } from "@/components/public/blog/markdown-sanitize"
import { MathCopyEnhancer } from "@/components/public/blog/math-copy-enhancer"
import { MermaidBlock } from "@/components/public/blog/mermaid-block"
import { TableBlock } from "@/components/public/blog/table-block"
import { getConfiguredImageHosts } from "@/lib/markdown-image-policy"
import {
  createCodeMetaResolver,
  createHeadingIdFactory,
  extractMarkdownImageSources,
  extractTextFromReactNode,
  type MarkdownContentKind,
  resolveMarkdownImageSrc,
} from "@/components/public/blog/markdown-utils"

interface MarkdownContentProps {
  content: string
  slug?: string
  contentKind?: MarkdownContentKind
  className?: string
}

function getMermaidChart(children: ReactNode) {
  const codeBlock = getCodeBlock(children)

  if (codeBlock?.language !== "mermaid") {
    return null
  }

  return codeBlock.code
}

function getCodeBlock(children: ReactNode) {
  if (!isValidElement(children)) {
    return null
  }

  const childProps = children.props as {
    className?: string
    "data-meta"?: string
    children?: ReactNode
    node?: {
      data?: {
        meta?: string
      }
    }
  }

  const language = /\blanguage-([\w-]+)\b/.exec(childProps.className ?? "")?.[1]

  if (!language) {
    return null
  }

  return {
    code: String(childProps.children ?? "").replace(/\n$/, ""),
    language,
    meta: childProps.node?.data?.meta ?? childProps["data-meta"],
  }
}

export function MarkdownContent({ content, slug, contentKind = "posts", className }: MarkdownContentProps) {
  const normalizedContent = normalizeMarkdownContent(content)
  const getHeadingId = createHeadingIdFactory()
  const getH1Id = createHeadingIdFactory()
  const resolveCodeMeta = createCodeMetaResolver(normalizedContent)
  const gallery = extractMarkdownImageSources(normalizedContent, slug, contentKind)
  const allowedImageHosts = getConfiguredImageHosts()
  const rootId = `markdown-content-${slug ?? hashContent(normalizedContent)}`

  return (
    <div
      id={rootId}
      data-article-content
      data-selection-share-scope
      className={cn(
        "prose dark:prose-invert prose-lg max-w-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-headings:text-foreground dark:prose-headings:text-foreground",
        "prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-6",
        "prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-p:text-muted-foreground prose-p:leading-8",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-code:text-primary prose-code:bg-secondary/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-card/80 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto",
        "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        "prose-li:marker:text-primary",
        "[&_ul.contains-task-list]:list-none [&_ul.contains-task-list]:pl-0",
        "[&_li.task-list-item]:pl-0 [&_li.task-list-item]:marker:content-none",
        "[&_li.task-list-item>input[type='checkbox']]:mr-2 [&_li.task-list-item>input[type='checkbox']]:align-middle",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic",
        "[&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2",
        "[&_.katex]:text-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeUnwrapImageParagraphs, [rehypeSanitize, markdownSanitizeSchema], rehypeKatex]}
        components={{
          h1({ children }) {
            const id = getH1Id(extractTextFromReactNode(children))
            return (
              <ArticleHeading id={id} level={1}>
                {children}
              </ArticleHeading>
            )
          },
          h2({ children }) {
            const id = getHeadingId(extractTextFromReactNode(children))
            return (
              <ArticleHeading id={id} level={2}>
                {children}
              </ArticleHeading>
            )
          },
          h3({ children }) {
            const id = getHeadingId(extractTextFromReactNode(children))
            return (
              <ArticleHeading id={id} level={3}>
                {children}
              </ArticleHeading>
            )
          },
          h4({ children }) {
            const id = getHeadingId(extractTextFromReactNode(children))
            return (
              <ArticleHeading id={id} level={4}>
                {children}
              </ArticleHeading>
            )
          },
          table({ children }) {
            return <TableBlock>{children}</TableBlock>
          },
          th({ children }) {
            return (
              <th className="border border-border/50 bg-secondary/95 px-4 py-3 font-semibold text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-secondary/85">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="border border-border/40 px-4 py-3 text-muted-foreground">{children}</td>
          },
          p({ children }) {
            const childArray = Children.toArray(children).filter((child) => {
              return !(typeof child === "string" && child.trim() === "")
            })

            if (childArray.length === 1 && isValidElement(childArray[0]) && childArray[0].type === MarkdownImage) {
              return <>{childArray[0]}</>
            }

            return <p>{children}</p>
          },
          img({ src, alt, title }) {
            const resolvedSrc = resolveMarkdownImageSrc(typeof src === "string" ? src : undefined, slug, contentKind)
            const initialIndex = resolvedSrc ? gallery.indexOf(resolvedSrc) : -1
            return (
              <MarkdownImage
                src={resolvedSrc}
                alt={alt ?? ""}
                title={title}
                allowedHosts={allowedImageHosts}
                gallery={gallery}
                initialIndex={initialIndex >= 0 ? initialIndex : 0}
              />
            )
          },
          pre({ children }) {
            const codeBlock = getCodeBlock(children)
            const chart = getMermaidChart(children)

            if (chart) {
              return <MermaidBlock chart={chart} />
            }

            if (codeBlock) {
              const meta = resolveCodeMeta(codeBlock.code, codeBlock.language, codeBlock.meta)
              return (
                <CodeBlock
                  code={codeBlock.code}
                  language={codeBlock.language}
                  filename={meta.filename}
                  title={meta.title}
                  caption={meta.caption}
                  highlightLines={meta.highlightLines}
                />
              )
            }

            return <pre>{children}</pre>
          },
          code({ className, children, node, ...props }) {
            const meta = (node as { data?: { meta?: string } } | undefined)?.data?.meta
            return (
              <code className={className} data-meta={meta} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
      <MathCopyEnhancer rootId={rootId} />
    </div>
  )
}

function normalizeMarkdownContent(content: string) {
  return content.replace(/^(\s*)\[\]\s+(.+)$/gm, "$1- [ ] $2").replace(/^(\s*)\[x\]\s+(.+)$/gim, "$1- [x] $2")
}

function rehypeUnwrapImageParagraphs() {
  return function transform(tree: HastNode) {
    visitHast(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "p") {
        return
      }

      const meaningfulChildren = (node.children ?? []).filter((child) => {
        return child.type !== "text" || (child.value ?? "").trim() !== ""
      })

      if (meaningfulChildren.length === 1 && meaningfulChildren[0]?.type === "element" && meaningfulChildren[0].tagName === "img") {
        node.tagName = "div"
        node.properties = {
          ...(node.properties ?? {}),
          className: mergeClassName(node.properties?.className, "markdown-image-block"),
        }
      }
    })
  }
}

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function visitHast(node: HastNode, visitor: (node: HastNode) => void) {
  visitor(node)
  node.children?.forEach((child) => visitHast(child, visitor))
}

function mergeClassName(value: unknown, className: string) {
  if (Array.isArray(value)) {
    return [...value, className]
  }
  if (typeof value === "string") {
    return `${value} ${className}`
  }
  return [className]
}

function hashContent(content: string) {
  let hash = 0

  for (let index = 0; index < content.length; index += 1) {
    hash = (hash * 31 + content.charCodeAt(index)) | 0
  }

  return Math.abs(hash).toString(36)
}
