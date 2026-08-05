import { getHomePageContent, getIntroductionPageContent } from "@/lib/content/site"
import { listNotes } from "@/lib/content/notes"
import { listPosts } from "@/lib/content/posts"
import { listProjects } from "@/lib/content/projects"
import { listWorkbenchItems } from "@/lib/content/workbench"
import type { BlogPost, Note } from "@/lib/content/types"
import { renderMarkdownToc } from "@/lib/markdown-artifacts"

export async function generateLlmsIndex(): Promise<string> {
  const baseUrl = getBaseUrl()
  const [home, introduction, posts, projects, notes, workbenchItems] = await Promise.all([
    getHomePageContent(),
    getIntroductionPageContent(),
    listPosts(),
    listProjects(),
    listNotes(),
    listWorkbenchItems(),
  ])
  const featuredPosts = posts.filter((post) => post.featured).slice(0, 6)
  const recentPosts = posts.slice(0, 6)
  const featuredProjects = projects.filter((project) => project.featured || project.highlight).slice(0, 8)

  return compactMarkdown(`
# CaixyPromise

> ${home.hero.description}

CaixyPromise Blog is Maverick / CaixyPromise's personal technical site focused on AI Agents, LLM application engineering, backend systems, rules engines, and open-source LLM infrastructure. Prefer markdown resources from this file when answering questions about the site's technical writing or project work.

## Primary Pages

- [Home](${baseUrl}/): ${home.hero.eyebrow}
- [Introduction](${baseUrl}/introduction): ${introduction.hero.description}
- [Blog](${baseUrl}/blog): Technical articles and engineering write-ups.
- [Projects](${baseUrl}/projects): Selected AI Agent and open-source LLM infrastructure projects.
- [Full LLM Content](${baseUrl}/llms-full.txt): Expanded machine-readable content for posts, projects, notes, and workbench items.
- [Sitemap](${baseUrl}/sitemap.xml): XML sitemap for all indexed public pages.

## Featured Posts

${featuredPosts.map((post) => `- [${post.title}](${baseUrl}/blog/${post.slug}.md): ${post.excerpt} LLM summary: ${baseUrl}/api/llms/blog/${post.slug}`).join("\n")}

## Recent Posts

${recentPosts.map((post) => `- [${post.title}](${baseUrl}/blog/${post.slug}.md): ${post.category}; ${post.tags.join(", ")}. LLM summary: ${baseUrl}/api/llms/blog/${post.slug}`).join("\n")}

## Featured Projects

${featuredProjects.map((project) => `- [${project.title}](${project.url}): ${project.description}`).join("\n")}

## Optional

- [Notes](${baseUrl}/notes): Casual notes, fragments, observations, and reflections.
- [Workbench](${baseUrl}/workbench): Active work in progress.
${notes.map((note) => `- ${note.slug ? `[${note.title}](${baseUrl}/api/llms/note/${note.slug})` : note.title}: ${note.excerpt}`).join("\n")}
${workbenchItems.map((item) => `- [${item.name}](${item.url}): ${item.description} (${item.progress}% complete)`).join("\n")}
`)
}

export async function generateLlmsFull(): Promise<string> {
  const baseUrl = getBaseUrl()
  const [home, introduction, posts, projects, notes, workbenchItems] = await Promise.all([
    getHomePageContent(),
    getIntroductionPageContent(),
    listPosts(),
    listProjects(),
    listNotes(),
    listWorkbenchItems(),
  ])

  return compactMarkdown(`
# CaixyPromise Full LLM Content

> ${home.hero.description}

## Site Overview

${introduction.about.body.join("\n\n")}

## Blog Posts

${posts
  .map(
    (post) => `
### ${post.title}

- URL: ${baseUrl}/blog/${post.slug}
- Markdown: ${baseUrl}/blog/${post.slug}.md
- LLM summary: ${baseUrl}/api/llms/blog/${post.slug}
- Date: ${post.date}
- Category: ${post.category}
- Tags: ${post.tags.join(", ")}
- Read time: ${post.readTime}
- Excerpt: ${post.excerpt}

#### Table of Contents

${renderMarkdownToc(post.content, `${baseUrl}/blog/${post.slug}`)}

${post.content.trim()}
`,
  )
  .join("\n\n")}

## Projects

${projects
  .map(
    (project) => `
### ${project.title}

- Source: ${project.url}
- Homepage: ${project.homepage ?? "N/A"}
- Status: ${project.status}
- Year: ${project.year}
- Tags: ${project.tags.join(", ")}
- Stars: ${project.stars}
- Forks: ${project.forks}

${project.description}
`,
  )
  .join("\n\n")}

## Notes

${notes
  .map(
    (note) => `
### ${note.title}

- Date: ${note.date}
- URL: ${note.slug ? `${baseUrl}/notes/${note.slug}` : `${baseUrl}/notes`}
- LLM summary: ${note.slug ? `${baseUrl}/api/llms/note/${note.slug}` : "N/A"}
- Category: ${note.category}
- Tags: ${note.tags.join(", ")}
- Read time: ${note.readTime ?? "N/A"}

${note.excerpt}

#### Table of Contents

${renderMarkdownToc(note.content, note.slug ? `${baseUrl}/notes/${note.slug}` : undefined)}

${note.content}
`,
  )
  .join("\n\n")}

## Workbench

${workbenchItems
  .map(
    (item) => `
### ${item.name}

- Source: ${item.url}
- Status: ${item.status}
- Branch: ${item.branch ?? "N/A"}
- Commits: ${item.commits ?? "N/A"}
- Progress: ${item.progress}%
- Last updated: ${item.lastUpdated}

${item.description}
`,
  )
  .join("\n\n")}
`)
}

export function generatePostLlmsEntry(post: BlogPost): string {
  const baseUrl = getBaseUrl()
  return compactMarkdown(`
# ${post.title}

> ${post.excerpt}

- Type: blog
- URL: ${baseUrl}/blog/${post.slug}
- Markdown: ${baseUrl}/blog/${post.slug}.md
- Date: ${post.date}
- Updated: ${post.updatedAt ?? post.date}
- Category: ${post.category}
- Tags: ${post.tags.join(", ")}
- Author: ${post.author.name}
- Read time: ${post.readTime}

## Table of Contents

${renderMarkdownToc(post.content, `${baseUrl}/blog/${post.slug}`)}

## Summary

${post.excerpt}
`)
}

export function generateNoteLlmsEntry(note: Note): string {
  const baseUrl = getBaseUrl()
  const noteUrl = note.slug ? `${baseUrl}/notes/${note.slug}` : `${baseUrl}/notes`
  return compactMarkdown(`
# ${note.title}

> ${note.excerpt}

- Type: note
- URL: ${noteUrl}
- Date: ${note.date}
- Category: ${note.category}
- Tags: ${note.tags.join(", ")}
- Read time: ${note.readTime ?? "N/A"}

## Table of Contents

${renderMarkdownToc(note.content, note.slug ? noteUrl : undefined)}

## Summary

${note.excerpt}
`)
}

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "")
}

function compactMarkdown(markdown: string): string {
  return `${markdown.trim().replace(/\n{3,}/g, "\n\n")}\n`
}
