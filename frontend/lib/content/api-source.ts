import { ContentFetchError, fetchWrapper } from "./fetch-wrapper"
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

export const apiSource: ContentSource = {
  getProfileContent(locale) {
    return fetchWrapper<ProfileContent>(withLocaleQuery("/site/profile", locale), {
      revalidate: 600,
      tags: ["site", "profile"],
    })
  },
  getHomePageContent(locale) {
    return fetchWrapper<HomePageContent>(withLocaleQuery("/pages/home", locale), {
      revalidate: 600,
      tags: ["site", "home"],
    })
  },
  getIntroductionPageContent(locale) {
    return fetchWrapper<IntroductionPageContent>(withLocaleQuery("/pages/introduction", locale), {
      revalidate: 600,
      tags: ["site", "introduction"],
    })
  },
  listPosts() {
    return fetchWrapper<BlogPost[]>("/posts", { revalidate: 300, tags: ["posts", "sitemap"] })
  },
  listPostSlugs() {
    return fetchWrapper<string[]>("/posts/slugs", { revalidate: 300, tags: ["posts", "sitemap"] })
  },
  async getPostBySlug(slug: string) {
    try {
      return await fetchWrapper<BlogPost>(`/posts/${encodeURIComponent(slug)}`, {
        revalidate: 300,
        tags: ["posts", `post:${slug}`],
      })
    } catch (error) {
      if (error instanceof ContentFetchError && error.status === 404) {
        return undefined
      }
      throw error
    }
  },
  listProjects() {
    return fetchWrapper<Project[]>("/projects", { revalidate: 600, tags: ["projects", "sitemap"] })
  },
  listNotes() {
    return fetchWrapper<Note[]>("/notes", { revalidate: 300, tags: ["notes", "sitemap"] })
  },
  async getNoteBySlug(slug) {
    return (await this.listNotes()).find((note) => note.slug === slug)
  },
  listWorkbenchItems() {
    return fetchWrapper<WorkbenchItem[]>("/workbench/items", { revalidate: 600, tags: ["workbench"] })
  },
  listWorkbenchActivity() {
    return fetchWrapper<WorkbenchActivity[]>("/workbench/activity", {
      revalidate: 300,
      tags: ["workbench"],
    })
  },
}

function withLocaleQuery(path: string, locale?: Locale): string {
  if (!locale || locale === "zh") {
    return path
  }

  return `${path}${path.includes("?") ? "&" : "?"}locale=${locale}`
}
