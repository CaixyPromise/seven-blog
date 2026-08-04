"use client"

import { useMemo, useState } from "react"
import { BlogList, type BlogListItem } from "@/components/public/blog/blog-list"
import { BlogSidebar } from "@/components/public/blog/blog-sidebar"
import type { Messages, Locale } from "@/lib/i18n"

interface BlogPageContentProps {
  posts: BlogListItem[]
  categories: Array<{ name: string; count: number; slug: string }>
  popularTags: string[]
  copy: Messages["blog"]
  locale: Locale
}

export function BlogPageContent({ posts, categories, popularTags, copy, locale }: BlogPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return posts.filter((post) => {
      const matchesCategory = activeCategory === "all" || post.category === activeCategory
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => post.tags.includes(tag))
      const searchableText = [post.title, post.excerpt, post.category, ...post.tags].join(" ").toLowerCase()
      const matchesSearch = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery)

      return matchesCategory && matchesTags && matchesSearch
    })
  }, [activeCategory, posts, searchQuery, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]))
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
      <div>
        <BlogList posts={filteredPosts} copy={copy} locale={locale} />
        {filteredPosts.length === 0 && (
          <div className="rounded-xl border border-border/50 bg-card/40 p-8 text-sm text-muted-foreground">
            {copy.empty}
          </div>
        )}
      </div>
      <BlogSidebar
        categories={categories}
        popularTags={popularTags}
        copy={copy}
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        selectedTags={selectedTags}
        onSearchQueryChange={setSearchQuery}
        onCategoryChange={setActiveCategory}
        onToggleTag={toggleTag}
      />
    </div>
  )
}
