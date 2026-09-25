# Offline Content And CMS-Ready Design

This document describes how to turn the current personal blog into an offline-first content system while keeping the frontend ready for a future CMS. The core rule is that page components must not know whether content comes from local files, a Node API, or a full CMS.

## Goals

- Keep blog content editable as local files for the first version.
- Express profile, resume, homepage, navigation, projects, and workbench data as JSON.
- Express posts and notes as local Markdown files with Hexo-style frontmatter.
- Keep existing frontend pages calling `lib/content/*` domain functions.
- Add a small Node backend only for interactive data: messages, comments, reply URLs, and notifications.
- Make the later migration to a CMS an adapter change, not a page rewrite.

## Current Baseline

The implemented app now has this boundary:

```txt
app/* pages
  -> components/*
  -> lib/content/*
  -> ContentSource
  -> fileSource or apiSource
```

Existing reader-facing routes read from the same domain functions:

```txt
/
/blog
/blog/:slug
/projects
/notes
/workbench
/sitemap.xml
/llms.txt
/llms-full.txt
/blog/:slug.md
```

Keep preserving this shape:

```txt
pages/components never import content files directly
pages/components call domain functions only
domain functions read from a configured content source
```

## Target Architecture

```txt
frontend/
  app/
  components/
  content/
    site/profile.json
    site/home.json
    site/introduction.json
    site/navigation.json
    posts/*.md
    notes/*.md
    projects/*.json
    workbench/*.json
  lib/
    content/
      index.ts
      source.ts
      file-source.ts
      api-source.ts
      posts.ts
      notes.ts
      projects.ts
      site.ts
      workbench.ts

backend/
  src/
    server.ts
    db.ts
    mailer.ts
    notifier.ts
    routes/messages.ts
    routes/comments.ts
    routes/replies.ts
  data/blog.sqlite
```

The frontend has two read-only content sources:

```ts
interface ContentSource {
  getHomePageContent(): Promise<HomePageContent>
  getIntroductionPageContent(): Promise<IntroductionPageContent>
  listPosts(): Promise<BlogPost[]>
  listPostSlugs(): Promise<string[]>
  getPostBySlug(slug: string): Promise<BlogPost | undefined>
  listProjects(): Promise<Project[]>
  listNotes(): Promise<Note[]>
  listWorkbenchItems(): Promise<WorkbenchItem[]>
  listWorkbenchActivity(): Promise<WorkbenchActivity[]>
}
```

Initial implementation:

```txt
CONTENT_SOURCE=file
```

Future implementation:

```txt
CONTENT_SOURCE=api
CONTENT_API_BASE_URL=/api
```

The domain modules keep their exported function names. Only the source implementation changes.

## Offline Content Files

### Profile And Resume

Use JSON for structured profile and resume content.

```txt
content/site/profile.json
```

```json
{
  "siteName": "EINCODE",
  "brandName": "EinCode",
  "tagline": "Where Code Meets Curiosity",
  "owner": {
    "name": "Ehsan Ghaffar",
    "role": "Software Engineer",
    "avatar": "/developer-portrait.png",
    "bio": "A software engineer building tools, experiments, and open-source systems.",
    "location": "Remote"
  },
  "contact": {
    "email": "hello@example.com",
    "availabilityText": "Open to collaborations and interesting engineering problems."
  },
  "socialLinks": [
    {
      "label": "GitHub",
      "href": "https://github.com/ehsanghaffar",
      "platform": "github",
      "visibleInHeader": true,
      "visibleInFooter": true,
      "sortOrder": 1
    }
  ],
  "resume": {
    "summary": "Short resume summary.",
    "skills": ["TypeScript", "Next.js", "Node.js"],
    "experience": [
      {
        "company": "Example",
        "role": "Software Engineer",
        "startDate": "2023-01",
        "endDate": null,
        "summary": "Built product and platform systems.",
        "highlights": ["Improved delivery speed", "Designed core APIs"]
      }
    ]
  }
}
```

### Homepage And Introduction

Keep page copy in JSON. These are singleton page records, not lists.

```txt
content/site/home.json
content/site/introduction.json
content/site/navigation.json
```

The JSON shape should match `HomePageContent`, `IntroductionPageContent`, and `NavigationItem[]` from `docs/data-models.md`.

### Posts

Use local Markdown with frontmatter:

```txt
content/posts/nextjs-16-tailwind-v4-migration.md
```

```md
---
title: Next.js 16 + Tailwind CSS v4 Migration Guide
slug: nextjs-16-tailwind-v4-migration
date: 2024-12-10
updatedAt: 2024-12-10
readTime: 10 min read
category: frontend
tags:
  - nextjs
  - tailwind
  - react
featured: true
draft: false
author:
  name: Ehsan Ghaffar
  avatar: /developer-portrait.png
  role: Software Engineer
excerpt: Exploring the new features in Next.js 16 and migrating to Tailwind CSS v4.
---

Markdown body goes here.
```

Rules:

- `slug` must be unique and stable.
- `draft: true` content is never returned by public domain functions.
- `updatedAt` should drive sitemap `lastModified` when available.
- `excerpt` is required for listing, metadata, OG, and `llms.txt`.
- The body remains Markdown. The renderer should stay frontend-owned.

### Notes

Use the same Markdown strategy, with a lighter schema:

```txt
content/notes/react-server-components-deep-dive.md
```

```md
---
title: React Server Components deep dive
slug: react-server-components-deep-dive
date: 2023-08-01
category: frontend
tags:
  - React
  - RSC
  - Next.js
featured: false
draft: false
readTime: 9 min
excerpt: Understanding the paradigm shift with RSC.
---

Short-form note body.
```

Notes may start without detail pages. If note detail pages become public later, make `slug` required in the model and add sitemap entries.

### Projects And Workbench

Projects can be JSON because they are structured records and often point outside the site.

```txt
content/projects/projects.json
content/workbench/items.json
content/workbench/activity.json
```

Use the models already documented in `docs/data-models.md`.

## Current Implementation

Implemented files:

```txt
frontend/content/site/profile.json
frontend/content/site/home.json
frontend/content/site/introduction.json
frontend/content/site/navigation.json
frontend/content/posts/*.md
frontend/content/notes/*.md
frontend/content/projects/projects.json
frontend/content/workbench/items.json
frontend/content/workbench/activity.json

frontend/lib/content/types.ts
frontend/lib/content/source.ts
frontend/lib/content/file-source.ts
frontend/lib/content/api-source.ts
frontend/lib/content/posts.ts
frontend/lib/content/notes.ts
frontend/lib/content/projects.ts
frontend/lib/content/site.ts
frontend/lib/content/workbench.ts

backend/src/server.ts
backend/src/db.ts
backend/src/mailer.ts
backend/src/notifier.ts
backend/src/routes/messages.ts
backend/src/routes/comments.ts
backend/src/routes/replies.ts
backend/migrations/001_init.sql
```

Behavior now enforced by the file source:

- `draft: true` posts and notes are filtered out of public lists and details.
- Posts and notes are sorted by `date` descending.
- Duplicate slugs throw during content loading.
- JSON and Markdown schema errors include the source file path.
- Sitemap, OG image, `llms.txt`, `llms-full.txt`, and `/blog/:slug.md` continue to use the domain content functions.

## File Loader Design

The file content source lives under:

```txt
lib/content/file-source.ts
```

Responsibilities:

- Read JSON files with `fs/promises`.
- Read Markdown files from `content/posts` and `content/notes`.
- Parse frontmatter.
- Validate records with `zod`.
- Sort posts and notes by date descending.
- Filter out drafts.
- Keep parsing uncached during local development so file changes are visible after restart or rebuild.

Dependencies:

```txt
gray-matter
zod
```

`gray-matter` is used for frontmatter parsing. `zod` validates the resulting records.

Do not parse frontmatter with regular expressions. It is too easy to mishandle arrays, nested author objects, and quoted strings.

## API Source Design

The existing `fetchWrapper` already supports this direction:

```txt
CONTENT_API_BASE_URL=http://localhost:4000/api
CONTENT_API_BASE_URL=/api
```

The API source lives under:

```txt
lib/content/api-source.ts
```

It implements the same `ContentSource` interface and calls:

```txt
GET /posts
GET /posts/:slug
GET /projects
GET /notes
GET /pages/home
GET /pages/introduction
GET /workbench/items
GET /workbench/activity
```

When a full CMS is introduced, it can sit behind these endpoints. The frontend does not need to know whether the backend reads from Strapi, Directus, Sanity, Payload, a database, or markdown files.

## Source Selection

Source selection lives in:

```txt
lib/content/source.ts
```

Recommended environment variable:

```env
CONTENT_SOURCE=file
# or
CONTENT_SOURCE=api
```

Behavior:

```ts
if (process.env.CONTENT_SOURCE === "api" || process.env.CONTENT_API_BASE_URL) {
  return apiSource
}

return fileSource
```

Current implementation reads real files by default. There is no scattered mock array fallback in page-facing domain modules.

## Interactive Backend

Keep comments, contact messages, reply URLs, and notifications out of the static content source.

Why:

- They are user-generated data.
- They require write APIs.
- They need anti-spam and rate limiting.
- They should not be committed into Git.
- They need private notification credentials.

Implemented backend:

```txt
backend/
  package.json
  src/server.ts
  src/db.ts
  src/mailer.ts
  src/notifier.ts
```

Stack:

```txt
fastify
better-sqlite3
nodemailer
zod
dotenv
```

Minimum endpoints:

```txt
POST /messages
POST /comments
GET /reply/:token
POST /reply/:token
GET /health
```

SQLite tables:

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE reply_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL
);
```

Notification order:

1. Send email first.
2. If configured, also send Feishu webhook.
3. If configured, also send WeCom webhook.
4. Record notification success or failure.

Environment variables:

```env
BACKEND_PORT=4000
BACKEND_BASE_URL=http://localhost:4000
PUBLIC_SITE_URL=http://localhost:3000
DATABASE_PATH=./data/blog.sqlite

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CONTACT_NOTIFY_TO=

FEISHU_WEBHOOK_URL=
WECOM_WEBHOOK_URL=
REPLY_TOKEN_SECRET=
```

Reply flow:

```txt
visitor submits message/comment
  -> backend validates and stores it in SQLite
  -> backend creates reply token
  -> backend sends notification email with reply_url
  -> owner opens reply_url
  -> owner submits reply
  -> backend sends email to visitor
  -> backend marks message/comment as replied
```

For the first version, comments can be private or manually moderated. Public comment rendering can be added later.

## Frontend Integration For Writes

The frontend should call the Node backend for writes:

```env
NEXT_PUBLIC_INTERACTION_API_BASE_URL=http://localhost:4000
```

Initial UI surfaces:

- `/contact`.
- Footer primary CTA opens `/contact`.
- Blog post comment form.
- Newsletter form can become `POST /messages` with `source: "newsletter"` or a dedicated endpoint later.

Keep these as client islands. They should not affect SSR content rendering.

## CMS Migration Path

The migration should happen in phases:

### Phase 1: Local Files

- Content lives in `content/`.
- Frontend domain functions read files through `fileSource`.
- Blog posts and notes are Markdown.
- Profile, homepage, navigation, projects, and workbench are JSON.
- Node backend stores only interactive data.

### Phase 2: Node Read API

- Add read-only endpoints to the Node backend.
- Configure frontend with `CONTENT_SOURCE=api`.
- Keep file source as the backend storage implementation.
- Frontend now reads through HTTP but the backend still reads files.

### Phase 3: CMS Storage

- Replace backend file reads with CMS/database reads.
- Keep endpoint response models stable.
- Keep frontend domain functions unchanged.
- Keep sitemap, OG, `llms.txt`, and `.md` routes generated from the same domain functions.

## Local Development

Install and run the frontend:

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Install and run the interaction backend:

```bash
cd backend
pnpm install
cp .env.example .env
pnpm run dev
```

With pnpm 10, `better-sqlite3` may require build approval:

```bash
pnpm approve-builds
```

Select `better-sqlite3`, approve it, then rerun:

```bash
pnpm rebuild better-sqlite3
```

Minimum backend environment for successful email notification:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=example
SMTP_PASS=<smtp-password>
SMTP_FROM=blog@example.com
CONTACT_NOTIFY_TO=owner@example.com
```

If SMTP is not configured, `POST /messages` still validates and stores the message, but returns `503` with the missing SMTP variables. This makes local setup failures explicit instead of silently dropping notifications.

## Writing Content

Add a blog post:

```txt
frontend/content/posts/my-post-slug.md
```

Required frontmatter:

```yaml
title: My Post
slug: my-post-slug
date: 2026-06-26
readTime: 5 min read
category: frontend
tags:
  - nextjs
featured: false
draft: false
excerpt: Short listing summary.
thumbnail: ./images/cover.png
author:
  name: Ehsan Ghaffar
  avatar: /developer-portrait.png
  role: Software Engineer
```

`thumbnail` is optional. It accepts a public site path, a path relative to the article's content directory, or an HTTPS CDN URL. If omitted, Blog and Note social metadata use the platform logo (`/brand-mark.png`). Remote thumbnail hosts must be included in `IMAGE_ALLOWED_HOSTS` so `pnpm content:check` accepts them.

Add or edit structured content in JSON:

```txt
frontend/content/site/home.json
frontend/content/site/introduction.json
frontend/content/projects/projects.json
frontend/content/workbench/items.json
```

After content edits, restart the dev server or rebuild for production. Generated routes such as sitemap, `llms.txt`, full LLM text, markdown export, and OG images are derived from the same domain functions.

### Phase 4: CMS Webhooks

- CMS publishes content.
- CMS calls frontend `POST /api/revalidate`.
- Frontend revalidates pages, data tags, sitemap, OG routes, `llms.txt`, `llms-full.txt`, and `/blog/:slug.md`.

## Change Scope

### Frontend Content Source

Files to add:

```txt
frontend/content/site/profile.json
frontend/content/site/home.json
frontend/content/site/introduction.json
frontend/content/site/navigation.json
frontend/content/posts/*.md
frontend/content/notes/*.md
frontend/content/projects/projects.json
frontend/content/workbench/items.json
frontend/content/workbench/activity.json
frontend/lib/content/types.ts
frontend/lib/content/source.ts
frontend/lib/content/file-source.ts
frontend/lib/content/api-source.ts
```

Files to change:

```txt
frontend/lib/content/posts.ts
frontend/lib/content/notes.ts
frontend/lib/content/projects.ts
frontend/lib/content/site.ts
frontend/lib/content/workbench.ts
frontend/lib/llms.ts
frontend/app/sitemap.ts
```

Expected page impact:

- Low. Pages already call domain functions.
- Medium risk around metadata, sitemap, and `generateStaticParams` because they depend on `slug`, `date`, and draft filtering.

### Backend Interaction Service

Files to add:

```txt
backend/package.json
backend/src/server.ts
backend/src/db.ts
backend/src/mailer.ts
backend/src/notifier.ts
backend/src/routes/messages.ts
backend/src/routes/comments.ts
backend/src/routes/replies.ts
backend/migrations/001_init.sql
```

Expected frontend impact:

- Add a contact form client island.
- Wire newsletter/contact/comment forms to backend endpoints.
- Add environment variable docs.

## Recommended First Milestone

The fastest useful milestone is:

1. Add `content/` with real JSON and Markdown files.
2. Add `fileSource`.
3. Update `lib/content/*` to use `fileSource`.
4. Keep the current UI unchanged.
5. Verify `/`, `/blog`, `/blog/:slug`, `/sitemap.xml`, `/llms.txt`, and `/blog/:slug.md`.

After that, add the Node interaction backend.

This order keeps the public blog stable while replacing the content foundation.
