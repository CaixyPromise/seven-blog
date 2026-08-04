import { cacheFileContent } from "./file-cache"
import { getContentSource } from "./source"
import type { Project, ProjectStatus } from "./types"

export type { Project, ProjectStatus }

export async function listProjects(): Promise<Project[]> {
  return cacheFileContent(
    { key: ["projects"], tags: ["projects", "sitemap", "llms"], revalidate: 600 },
    () => getContentSource().listProjects(),
  )
}

export async function listFeaturedProjects(): Promise<Project[]> {
  const projects = await listProjects()
  return projects.filter((project) => project.featured || project.highlight)
}

export async function listProjectStatuses(): Promise<Array<ProjectStatus | "all">> {
  return ["all", "shipped", "in-progress", "archived"]
}

export async function listProjectTags(): Promise<string[]> {
  const projects = await listProjects()
  return Array.from(new Set(projects.flatMap((project) => project.tags))).sort((a, b) => a.localeCompare(b))
}
