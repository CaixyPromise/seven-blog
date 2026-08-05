import { ProjectsPageContent } from "@/components/public/projects/projects-page-content";
import {
  listProjects,
  listProjectStatuses,
  listProjectTags,
  type Project,
  type ProjectStatus,
} from "@/lib/content/projects";
import type { Metadata } from "next";
import { getMessages, parseLocale } from "@/lib/i18n";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

interface ProjectsPageProps {
  searchParams: Promise<{
    status?: string
    query?: string
    tag?: string | string[]
    lang?: string | string[]
  }>
}

export async function generateMetadata({ searchParams }: ProjectsPageProps): Promise<Metadata> {
  const locale = parseLocale((await searchParams).lang)
  const copy = getMessages(locale).projects
  const path = locale === "en" ? "/projects?lang=en" : "/projects"

  return {
    title: copy.title,
    description: copy.description,
    keywords: ["Seven Agent", "Xiaozhi", "AI Agent", "LLM", "MCP", "open source"],
    openGraph: {
      title: `${copy.title} — CaixyPromise`,
      description: copy.description,
      url: `${baseUrl}${path}`,
      type: "website",
      images: [{ url: `${baseUrl}/projects/opengraph-image`, width: 1200, height: 630, alt: `CaixyPromise ${copy.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${copy.title} — CaixyPromise`,
      description: copy.description,
      images: [`${baseUrl}/projects/opengraph-image`],
    },
    alternates: { canonical: `${baseUrl}${path}` },
  }
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const [{ status, query, tag }, projects, statuses, allTags] = await Promise.all([
    searchParams,
    listProjects(),
    listProjectStatuses(),
    listProjectTags(),
  ]);

  const normalizedStatus = normalizeStatus(status);
  const locale = parseLocale((await searchParams).lang)
  const copy = getMessages(locale).projects
  const normalizedQuery = query?.trim() ?? "";
  const normalizedTags = Array.isArray(tag) ? tag : tag ? [tag] : [];
  const filteredProjects = filterProjects(projects, {
    status: normalizedStatus,
    query: normalizedQuery,
    tags: normalizedTags,
  });

  return (
    <div className="pt-24">
      <ProjectsPageContent
        projects={filteredProjects}
        statuses={statuses}
        allTags={allTags}
        filters={{
          status: normalizedStatus,
          query: normalizedQuery,
          tags: normalizedTags,
        }}
        copy={copy}
      />
    </div>
  );
}

function normalizeStatus(status?: string): ProjectStatus | "all" {
  if (status === "shipped" || status === "in-progress" || status === "archived") {
    return status;
  }
  return "all";
}

function filterProjects(
  projects: Project[],
  filters: {
    status: ProjectStatus | "all"
    query: string
    tags: string[]
  },
): Project[] {
  const query = filters.query.toLowerCase();
  return projects.filter((project) => {
    const matchesStatus = filters.status === "all" || project.status === filters.status;
    const matchesQuery =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => project.tags.includes(tag));

    return matchesStatus && matchesQuery && matchesTags;
  });
}
