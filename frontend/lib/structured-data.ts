import type { BlogPost, Note, ProfileContent } from "@/lib/content/types"

export function generateBlogPostStructuredData(post: BlogPost, url: string) {
  const postUrl = `${url}/blog/${post.slug}`
  const keywords = post.tags.join(", ")

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `${url}/blog/${post.slug}/opengraph-image`,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.updatedAt ?? post.date).toISOString(),
    inLanguage: "zh-CN",
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: 'https://github.com/CaixyPromise',
    },
    publisher: {
      '@type': 'Person',
      name: 'Maverick / CaixyPromise',
      url: 'https://example.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: post.category,
    keywords,
    timeRequired: post.readTime,
    url: postUrl,
    isAccessibleForFree: true,
    wordCount: estimateWordCount(post.content),
  }
}

export function generateNoteStructuredData(note: Note, url: string) {
  const noteUrl = `${url}/notes/${note.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: note.excerpt,
    datePublished: new Date(note.date).toISOString(),
    dateModified: new Date(note.date).toISOString(),
    inLanguage: "zh-CN",
    author: {
      "@type": "Person",
      name: "Maverick / CaixyPromise",
      url: "https://github.com/CaixyPromise",
    },
    publisher: {
      "@type": "Person",
      name: "Maverick / CaixyPromise",
      url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": noteUrl,
    },
    articleSection: note.category,
    keywords: note.tags.join(", "),
    timeRequired: note.readTime,
    url: noteUrl,
    isAccessibleForFree: true,
    wordCount: estimateWordCount(note.content),
  }
}

export function generateWebsiteStructuredData(url: string, profile: ProfileContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: profile.siteName,
    description: profile.description,
    url: url,
    author: {
      '@type': 'Person',
      name: profile.owner.name,
      url,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generatePersonStructuredData(profile: ProfileContent, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.owner.name,
    url: siteUrl,
    image: `${siteUrl}/avatar-1024.png`,
    sameAs: profile.socialLinks.map((link) => link.href),
    jobTitle: profile.owner.role,
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function estimateWordCount(content: string) {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[>#*_~|[\]()-]/g, " ")
    .trim()

  if (!plain) {
    return 0
  }

  const latinWords = plain.match(/[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*/g) ?? []
  const cjkChars = plain.match(/[\u3400-\u9fff]/g) ?? []
  return latinWords.length + cjkChars.length
}
