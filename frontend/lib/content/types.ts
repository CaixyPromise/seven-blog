import type { Locale } from "@/lib/i18n"

export interface Author {
  name: string
  avatar: string
  role: string
}

export interface ProfileContent {
  siteName: string
  brandName: string
  tagline: string
  description: string
  owner: {
    name: string
    role: string
    avatar: string
    bio: string
    location?: string
  }
  contact: {
    email: string
    availabilityText: string
    ctaLabel: string
  }
  socialLinks: Array<{
    label: string
    href: string
    handle: string
    platform: string
    visibleInHeader: boolean
    visibleInFooter: boolean
    sortOrder: number
  }>
  resume?: unknown
}

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  updatedAt?: string
  readTime: string
  category: string
  tags: string[]
  author: Author
  featured: boolean
  draft?: boolean
  color: string
}

export interface Note {
  id: number
  slug?: string
  title: string
  excerpt: string
  content: string
  date: string
  category: string
  tags: string[]
  color?: string
  readTime?: string
  featured?: boolean
  draft?: boolean
}

export type ProjectStatus = "shipped" | "in-progress" | "archived"

export interface Project {
  id: number
  title: string
  description: string
  tags: string[]
  status: ProjectStatus
  year: string
  stars: number
  forks: number
  url: string
  homepage?: string
  featured: boolean
  highlight?: boolean
}

export interface WorkbenchItem {
  id: number
  name: string
  description: string
  progress: number
  lastUpdated: string
  url: string
  branch?: string
  commits?: number
  status: "active" | "paused" | "shipped" | "archived"
  sortOrder: number
}

export interface WorkbenchActivity {
  id: string
  type: "commit" | "branch" | "release" | "note" | "custom"
  project: string
  message: string
  time: string
  href?: string
}

export interface HomePageContent {
  hero: {
    eyebrow: string
    titlePrefix: string
    rotatingPhrases: string[]
    description: string
    currentOrgPrefix?: string
    currentOrgSuffix?: string
    currentOrgLabel: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    terminalTitle: string
    terminalProfile: {
      title: string
      subtitle: string
      rows: Array<{ key: string; value: string }>
    }
    versionLabel: string
    dateLabel: string
  }
}

export interface IntroductionPageContent {
  hero: {
    eyebrow: string
    titlePrefix: string
    highlightedText: string
    description: string
  }
  about: {
    eyebrow: string
    title: string
    body: string[]
  }
  educationHeading: {
    eyebrow: string
    title: string
    description: string
  }
  education: {
    period: string
    school: string
    degree: string
    major: string
    gpa: string
    rank: string
    narrative: string[]
    courses: Array<{
      name: string
      score: number
    }>
  }
  experienceHeading: {
    eyebrow: string
    title: string
    description: string
  }
  experiences: Array<{
    period: string
    organization: string
    title: string
    type: string
    summary: string[]
    tags: string[]
  }>
  capabilitiesHeading: {
    eyebrow: string
    title: string
    description: string
  }
  capabilities: Array<{
    icon: "brain-circuit" | "server-cog" | "workflow" | "shield-check" | "container" | "users-round"
    title: string
    description: string
    skills: string[]
  }>
}

export interface ContentSource {
  getProfileContent(locale?: Locale): Promise<ProfileContent>
  getHomePageContent(locale?: Locale): Promise<HomePageContent>
  getIntroductionPageContent(locale?: Locale): Promise<IntroductionPageContent>
  listPosts(): Promise<BlogPost[]>
  listPostSlugs(): Promise<string[]>
  getPostBySlug(slug: string): Promise<BlogPost | undefined>
  listProjects(): Promise<Project[]>
  listNotes(): Promise<Note[]>
  getNoteBySlug(slug: string): Promise<Note | undefined>
  listWorkbenchItems(): Promise<WorkbenchItem[]>
  listWorkbenchActivity(): Promise<WorkbenchActivity[]>
}
