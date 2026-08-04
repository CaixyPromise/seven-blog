import { promises as fs } from "fs"
import path from "path"
import matter from "gray-matter"
import { z } from "zod"
import { getContentEnvironment, resolveContentPath as resolveContentRootPath } from "./content-root"
import type {
  BlogPost,
  ContentSource,
  HomePageContent,
  IntroductionPageContent,
  Note,
  ProfileContent,
  Project,
  WorkbenchActivity,
  WorkbenchItem,
} from "./types"
import type { Locale } from "@/lib/i18n"

const authorSchema = z.object({
  name: z.string(),
  avatar: z.string(),
  role: z.string(),
})

const profileContentSchema: z.ZodType<ProfileContent> = z.object({
  siteName: z.string(),
  brandName: z.string(),
  tagline: z.string(),
  description: z.string(),
  owner: z.object({
    name: z.string(),
    role: z.string(),
    avatar: z.string(),
    bio: z.string(),
    location: z.string().optional(),
  }),
  contact: z.object({
    email: z.string(),
    availabilityText: z.string(),
    ctaLabel: z.string(),
  }),
  socialLinks: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      handle: z.string(),
      platform: z.string(),
      visibleInHeader: z.boolean(),
      visibleInFooter: z.boolean(),
      sortOrder: z.number(),
    }),
  ),
  resume: z.unknown().optional(),
})

const blogPostFrontmatterSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  updatedAt: z.string().optional(),
  readTime: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: authorSchema,
  featured: z.boolean(),
  draft: z.boolean().optional(),
  color: z.string(),
})

const noteFrontmatterSchema = z.object({
  id: z.number(),
  slug: z.string().optional(),
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  color: z.string().optional(),
  readTime: z.string().optional(),
  featured: z.boolean().optional(),
  draft: z.boolean().optional(),
})

const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  status: z.enum(["shipped", "in-progress", "archived"]),
  year: z.string(),
  stars: z.number(),
  forks: z.number(),
  url: z.string(),
  homepage: z.string().optional(),
  featured: z.boolean(),
  highlight: z.boolean().optional(),
})

const workbenchItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  progress: z.number(),
  lastUpdated: z.string(),
  url: z.string(),
  branch: z.string().optional(),
  commits: z.number().optional(),
  status: z.enum(["active", "paused", "shipped", "archived"]),
  sortOrder: z.number(),
})

const workbenchActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["commit", "branch", "release", "note", "custom"]),
  project: z.string(),
  message: z.string(),
  time: z.string(),
  href: z.string().optional(),
})

const homePageContentSchema: z.ZodType<HomePageContent> = z.object({
  hero: z.object({
    eyebrow: z.string(),
    titlePrefix: z.string(),
    rotatingPhrases: z.array(z.string()),
    description: z.string(),
    currentOrgPrefix: z.string().optional(),
    currentOrgSuffix: z.string().optional(),
    currentOrgLabel: z.string(),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }),
    terminalTitle: z.string(),
    terminalProfile: z.object({
      title: z.string(),
      subtitle: z.string(),
      rows: z.array(z.object({ key: z.string(), value: z.string() })),
    }),
    versionLabel: z.string(),
    dateLabel: z.string(),
  }),
})

const introductionPageContentSchema: z.ZodType<IntroductionPageContent> = z.object({
  hero: z.object({
    eyebrow: z.string(),
    titlePrefix: z.string(),
    highlightedText: z.string(),
    description: z.string(),
  }),
  about: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.array(z.string()),
  }),
  educationHeading: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  education: z.object({
    period: z.string(),
    school: z.string(),
    degree: z.string(),
    major: z.string(),
    gpa: z.string(),
    rank: z.string(),
    narrative: z.array(z.string()).min(1),
    courses: z.array(
      z.object({
        name: z.string(),
        score: z.number().int().min(0).max(100),
      }),
    ),
  }),
  experienceHeading: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  experiences: z.array(
    z.object({
      period: z.string(),
      organization: z.string(),
      title: z.string(),
      type: z.string(),
      summary: z.array(z.string()).min(1),
      tags: z.array(z.string()),
    }),
  ),
  capabilitiesHeading: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  capabilities: z.array(
    z.object({
      icon: z.enum(["brain-circuit", "server-cog", "workflow", "shield-check", "container", "users-round"]),
      title: z.string(),
      description: z.string(),
      skills: z.array(z.string()),
    }),
  ),
})

export const fileSource: ContentSource = {
  getProfileContent(locale) {
    return readLocalizedConfigJson("site/profile.json", locale, profileContentSchema)
  },
  getHomePageContent(locale) {
    return readLocalizedConfigJson("site/home.json", locale, homePageContentSchema)
  },
  getIntroductionPageContent(locale) {
    return readLocalizedConfigJson("site/introduction.json", locale, introductionPageContentSchema)
  },
  async listPosts() {
    const posts = await readMarkdownCollection("posts", blogPostFrontmatterSchema, (frontmatter, content) => ({
      ...frontmatter,
      content,
    }))

    assertUniqueSlugs(
      posts.map((post) => post.slug),
      "content/posts",
    )

    return posts.filter((post) => !post.draft).sort(compareByDateDesc)
  },
  async listPostSlugs() {
    return (await this.listPosts()).map((post) => post.slug)
  },
  async getPostBySlug(slug: string) {
    return (await this.listPosts()).find((post) => post.slug === slug)
  },
  async listProjects() {
    return readConfigJson("projects/projects.json", z.array(projectSchema))
  },
  async listNotes() {
    const notes = await readMarkdownCollection("notes", noteFrontmatterSchema, (frontmatter, content) => ({
      ...frontmatter,
      content,
    }))

    const slugs = notes.flatMap((note) => (note.slug ? [note.slug] : []))
    assertUniqueSlugs(slugs, "content/notes")

    return notes.filter((note) => !note.draft).sort(compareByDateDesc)
  },
  async getNoteBySlug(slug) {
    return (await this.listNotes()).find((note) => note.slug === slug)
  },
  async listWorkbenchItems() {
    const items = await readConfigJson("workbench/items.json", z.array(workbenchItemSchema))
    return items.sort((a, b) => a.sortOrder - b.sortOrder)
  },
  listWorkbenchActivity() {
    return readConfigJson("workbench/activity.json", z.array(workbenchActivitySchema))
  },
}

function localizePath(relativePath: string, locale?: Locale): string {
  if (!locale || locale === "zh") {
    return relativePath
  }

  const extension = path.extname(relativePath)
  const base = relativePath.slice(0, -extension.length)
  return `${base}.${locale}${extension}`
}

async function readLocalizedConfigJson<T>(relativePath: string, locale: Locale | undefined, schema: z.ZodType<T>): Promise<T> {
  return readConfigJson(localizePath(relativePath, locale), schema)
}

async function readConfigJson<T>(relativePath: string, schema: z.ZodType<T>): Promise<T> {
  return readJson(await resolveConfigPath(relativePath), schema)
}

async function resolveConfigPath(relativePath: string): Promise<string> {
  const extension = path.extname(relativePath)
  const base = relativePath.slice(0, -extension.length)
  const environment = getContentEnvironment()
  const environmentPath = `${base}.${environment}${extension}`
  const fullEnvironmentPath = resolveContentPath(environmentPath)

  try {
    await fs.access(fullEnvironmentPath)
    return environmentPath
  } catch (error) {
    if (isMissingFileError(error) && environment === "prod") {
      throw new Error(`Missing production content config: ${fullEnvironmentPath}`)
    }
    if (isMissingFileError(error)) {
      return relativePath
    }
    throw withPath(error, fullEnvironmentPath)
  }
}

async function readJson<T>(relativePath: string, schema: z.ZodType<T>): Promise<T> {
  const fullPath = resolveContentPath(relativePath)
  try {
    const raw = await fs.readFile(fullPath, "utf8")
    return parseWithSchema(JSON.parse(raw), schema, fullPath)
  } catch (error) {
    throw withPath(error, fullPath)
  }
}

async function readMarkdownCollection<TFrontmatter, TRecord>(
  directory: string,
  schema: z.ZodType<TFrontmatter>,
  mapRecord: (frontmatter: TFrontmatter, content: string) => TRecord,
): Promise<TRecord[]> {
  const fullDirectory = resolveContentPath(directory)
  let entries: string[]
  try {
    entries = await fs.readdir(fullDirectory)
  } catch (error) {
    throw withPath(error, fullDirectory)
  }

  const markdownFiles = entries.filter((entry) => entry.endsWith(".md")).sort()
  return Promise.all(
    markdownFiles.map(async (fileName) => {
      const fullPath = path.join(fullDirectory, fileName)
      try {
        const raw = await fs.readFile(fullPath, "utf8")
        const parsed = matter(raw)
        const frontmatter = parseWithSchema(parsed.data, schema, fullPath)
        return mapRecord(frontmatter, parsed.content.trim())
      } catch (error) {
        throw withPath(error, fullPath)
      }
    }),
  )
}

function parseWithSchema<T>(value: unknown, schema: z.ZodType<T>, filePath: string): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new Error(`Invalid content schema in ${filePath}: ${result.error.message}`)
  }

  return result.data
}

function resolveContentPath(relativePath: string): string {
  return resolveContentRootPath(relativePath)
}

function compareByDateDesc(left: { date: string }, right: { date: string }): number {
  return parseDate(right.date).getTime() - parseDate(left.date).getTime()
}

function parseDate(value: string): Date {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function assertUniqueSlugs(slugs: string[], source: string) {
  const seen = new Set<string>()
  for (const slug of slugs) {
    if (seen.has(slug)) {
      throw new Error(`Duplicate slug "${slug}" in ${source}`)
    }
    seen.add(slug)
  }
}

function withPath(error: unknown, filePath: string): Error {
  if (error instanceof Error) {
    error.message = `${error.message} (${filePath})`
    return error
  }

  return new Error(`Failed to read content file: ${filePath}`)
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT"
}
