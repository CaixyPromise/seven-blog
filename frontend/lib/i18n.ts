export type Locale = "zh" | "en"

export const defaultLocale: Locale = "zh"
export const messages = {
  zh: {
    nav: {
      home: "首页",
      projects: "项目",
      notes: "随笔",
      workbench: "工作台",
      blog: "博客",
      status: "持续创造中",
    },
    footer: {
      eyebrow: "联系",
      titlePrefix: "持续创造，",
      titleHighlight: "持续记录",
      description: "这里是我记录生活、想法和笔记的地方，也欢迎您与我交流。",
      cta: "联系我",
      elsewhere: "联系我",
      made: "用代码和热爱创造",
      rights: "用代码改变世界",
    },
    blog: {
      eyebrow: "学习笔记",
      titlePrefix: "技术博客与",
      titleHighlight: "学习记录",
      description: "这里放相对完整的学习笔记、技术文章和工程复盘。",
      readArticle: "阅读全文",
      featured: "推荐",
      back: "返回博客",
      relatedLabel: "[相关阅读]",
      continuePrefix: "继续",
      continueHighlight: "阅读",
      search: "搜索文章...",
      categories: "分类",
      allPosts: "全部文章",
      popularTags: "热门标签",
      empty: "没有找到匹配的文章。",
      newsletter: "订阅更新",
      newsletterDescription: "有新文章和项目咨询时通知你。不刷屏，也不打扰。",
      subscribe: "订阅",
      rss: "通过 RSS 订阅",
    },
    notes: {
      eyebrow: "随心笔记",
      title: "随笔与碎片",
      description: "这里放一些随性的记录：想法、生活记录。",
      search: "搜索随笔...",
      categories: "分类",
      tags: "标签",
      all: "全部",
      readMore: "阅读随笔",
      empty: "没有找到匹配的随笔。",
      back: "返回随笔",
      featured: "推荐",
      relatedLabel: "[相关随笔]",
      continuePrefix: "继续",
      continueHighlight: "阅读",
    },
    projects: {
      eyebrow: "项目",
      title: "项目与作品",
      description: "这里放我想长期维护或阶段性记录的项目，用心将每一个有意义的idea变成现实！",
      featured: "重点",
      source: "来源",
      live: "链接",
      empty: "没有找到匹配的项目。",
      search: "搜索项目...",
      statuses: {
        all: "全部",
        shipped: "已发布",
        "in-progress": "进行中",
        archived: "已归档",
      },
    },
    workbench: {
      eyebrow: "正在折腾",
      title: "正在折腾",
      description: "一些还在推进、整理或反复打磨的东西。",
      live: "进行中",
      command: "git status --all",
      hint: "按下回车运行",
      stats: "统计",
      active: "进行中",
      avgProgress: "平均进度",
      recentActivity: "最近动态",
      commits: "次提交",
    },
  },
  en: {
    nav: {
      home: "Home",
      projects: "Projects",
      notes: "Notes",
      workbench: "Workbench",
      blog: "Blog",
      status: "Still creating",
    },
    footer: {
      eyebrow: "Connect",
      titlePrefix: "Keep creating, ",
      titleHighlight: "keep documenting",
      description: "This is where I keep notes on life and ideas. You're always welcome to get in touch.",
      cta: "Contact me",
      elsewhere: "Contact",
      made: "Created with code and passion",
      rights: "Changing the world with code",
    },
    blog: {
      eyebrow: "Learning Notes",
      titlePrefix: "Technical Blog &",
      titleHighlight: "Learning Notes",
      description: "A place for longer learning notes, technical articles, and engineering retrospectives.",
      readArticle: "Read article",
      featured: "featured",
      back: "back to blog",
      relatedLabel: "[Related reading]",
      continuePrefix: "Continue",
      continueHighlight: "Reading",
      search: "Search articles...",
      categories: "Categories",
      allPosts: "All Posts",
      popularTags: "Popular Tags",
      empty: "No articles found matching your filters.",
      newsletter: "Newsletter",
      newsletterDescription: "Get notified about new articles and project updates. No noise, no interruptions.",
      subscribe: "Subscribe",
      rss: "Subscribe via RSS",
    },
    notes: {
      eyebrow: "Casual Notes",
      title: "Notes",
      description: "A place for more casual writing: ideas and notes from daily life.",
      search: "Search notes...",
      categories: "Categories",
      tags: "Tags",
      all: "all",
      readMore: "read note",
      empty: "No notes found matching your criteria.",
      back: "back to notes",
      featured: "featured",
      relatedLabel: "[Related notes]",
      continuePrefix: "Continue",
      continueHighlight: "Reading",
    },
    projects: {
      eyebrow: "Projects",
      title: "Selected Projects",
      description: "Projects I want to maintain over time or document at a particular stage. I try to turn every meaningful idea into something real.",
      featured: "Featured",
      source: "source",
      live: "link",
      empty: "No projects found matching your criteria.",
      search: "Search projects...",
      statuses: {
        all: "All",
        shipped: "Shipped",
        "in-progress": "In Progress",
        archived: "Archived",
      },
    },
    workbench: {
      eyebrow: "In the works",
      title: "In the works",
      description: "A few things I am still building, sorting through, or repeatedly refining.",
      live: "live",
      command: "git status --all",
      hint: "press enter to run",
      stats: "Stats",
      active: "Active",
      avgProgress: "Avg Progress",
      recentActivity: "Recent Activity",
      commits: "commits",
    },
  },
} as const

export type Messages = (typeof messages)[Locale]

export function parseLocale(value: unknown): Locale {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate === "en" ? "en" : defaultLocale
}

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}

export function withLocaleHref(href: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return href
  }

  const separator = href.includes("?") ? "&" : "?"
  return `${href}${separator}lang=${locale}`
}
