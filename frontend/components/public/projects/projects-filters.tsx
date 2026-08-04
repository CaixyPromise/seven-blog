"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/lib/content/projects"
import type { Messages } from "@/lib/i18n"

interface ProjectFiltersState {
  status: ProjectStatus | "all"
  query: string
  tags: string[]
}

interface ProjectsFiltersProps {
  statuses: Array<ProjectStatus | "all">
  allTags: string[]
  filters: ProjectFiltersState
  copy: Messages["projects"]
}

export function ProjectsFilters({ statuses, allTags, filters, copy }: ProjectsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(filters.query)

  const selectedTags = useMemo(() => new Set(filters.tags), [filters.tags])

  useEffect(() => {
    setQuery(filters.query)
  }, [filters.query])

  const updateFilters = (nextFilters: Partial<ProjectFiltersState>) => {
    const merged = {
      ...filters,
      query,
      ...nextFilters,
    }
    const params = new URLSearchParams()
    const lang = searchParams.get("lang")
    if (lang) {
      params.set("lang", lang)
    }

    if (merged.status !== "all") {
      params.set("status", merged.status)
    }
    if (merged.query.trim()) {
      params.set("query", merged.query.trim())
    }
    for (const tag of merged.tags) {
      params.append("tag", tag)
    }

    const target = params.toString() ? `${pathname}?${params.toString()}` : pathname
    startTransition(() => router.replace(target, { scroll: false }))
  }

  const toggleTag = (tag: string) => {
    const nextTags = selectedTags.has(tag) ? filters.tags.filter((item) => item !== tag) : [...filters.tags, tag]
    updateFilters({ tags: nextTags })
  }

  return (
    <div className={cn("mb-10 space-y-6 animate-fade-in-up stagger-2", isPending && "opacity-70")}>
      <form
        className="relative max-w-md"
        onSubmit={(event) => {
          event.preventDefault()
          updateFilters({ query })
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={copy.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => updateFilters({ query })}
          className="pl-10 bg-card/40 border-border/60 focus:border-primary/50"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => updateFilters({ status })}
            className={cn(
              "rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-300 active:scale-[0.98]",
              filters.status === status
                ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground hover:bg-secondary/50",
            )}
          >
            {copy.statuses[status]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Filter className="h-4 w-4 text-muted-foreground mr-2 self-center" />
        {allTags.slice(0, 10).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-xs transition-all duration-200",
              selectedTags.has(tag)
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
