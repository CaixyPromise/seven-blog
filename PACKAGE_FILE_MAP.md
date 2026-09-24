# Self Blog Package File Map

Generated: 2026-07-07

This archive is source-only. It intentionally excludes dependency folders, build output, local caches, and local runtime data.

## Top-Level Layout

```txt
frontend/   Next.js personal blog frontend
backend/    Fastify interaction backend for messages/comments/replies
LICENSE     Code license
CONTENT_LICENSE.md
            Content license
PACKAGE_FILE_MAP.md
            This file
```

## Frontend Entry Points

```txt
frontend/package.json
frontend/pnpm-lock.yaml
frontend/next.config.mjs
frontend/tsconfig.json
frontend/app/layout.tsx
frontend/app/page.tsx
frontend/app/globals.css
```

Main commands:

```bash
cd frontend
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm content:check
pnpm test:e2e
```

## Frontend Environment

```txt
frontend/.env.example
```

Important variables:

```env
CONTENT_SOURCE=file
CONTENT_API_BASE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_INTERACTION_API_BASE_URL=http://localhost:4000
IMAGE_ALLOWED_HOSTS=
REVALIDATE_SECRET=
```

`CONTENT_SOURCE=file` reads local Markdown/JSON from `frontend/content`. Setting `CONTENT_SOURCE=api` or `CONTENT_API_BASE_URL` switches reads to the API source wrappers in `frontend/lib/content/api-source.ts`.

## Content Source

```txt
frontend/content/site/profile.json
frontend/content/site/profile.en.json
frontend/content/site/home.json
frontend/content/site/home.en.json
frontend/content/site/introduction.json
frontend/content/site/introduction.en.json
frontend/content/site/navigation.json
frontend/content/posts/*.md
frontend/content/notes/*.md
frontend/content/projects/projects.json
frontend/content/workbench/items.json
frontend/content/workbench/activity.json
```

Content domain layer:

```txt
frontend/lib/content/types.ts
frontend/lib/content/source.ts
frontend/lib/content/file-source.ts
frontend/lib/content/api-source.ts
frontend/lib/content/fetch-wrapper.ts
frontend/lib/content/posts.ts
frontend/lib/content/notes.ts
frontend/lib/content/projects.ts
frontend/lib/content/site.ts
frontend/lib/content/workbench.ts
```

## Public Routes

```txt
frontend/app/(public)/blog/page.tsx
frontend/app/(public)/blog/[postSlug]/page.tsx
frontend/app/(public)/notes/page.tsx
frontend/app/(public)/notes/[noteSlug]/page.tsx
frontend/app/(public)/projects/page.tsx
frontend/app/(public)/workbench/page.tsx
frontend/app/(public)/introduction/page.tsx
frontend/app/(public)/contact/page.tsx
```

Generated and machine-readable routes:

```txt
frontend/app/sitemap.ts
frontend/app/robots.ts
frontend/app/rss.xml/route.ts
frontend/app/(public)/notes/rss.xml/route.ts
frontend/app/llms.txt/route.ts
frontend/app/llms-full.txt/route.ts
frontend/app/blog-md/[postSlug]/route.ts
frontend/app/api/llms/[kind]/[slug]/route.ts
frontend/app/api/revalidate/route.ts
```

## Shared Article Rendering

Blog and note detail pages both use the same article rendering and layout path:

```txt
frontend/components/public/blog/article-detail-content.tsx
frontend/components/public/blog/markdown-content.tsx
frontend/components/public/blog/article-heading.tsx
frontend/components/public/blog/blog-toc.tsx
frontend/components/public/blog/blog-post-actions.tsx
frontend/components/public/blog/article-selection-share.tsx
frontend/components/public/blog/code-block.tsx
frontend/components/public/blog/mermaid-block.tsx
frontend/components/public/blog/table-block.tsx
frontend/components/public/blog/markdown-image.tsx
frontend/components/public/blog/math-copy-enhancer.tsx
```

Markdown helper and security policy:

```txt
frontend/components/public/blog/markdown-utils.ts
frontend/components/public/blog/markdown-copy.ts
frontend/components/public/blog/markdown-sanitize.ts
frontend/docs/markdown-security.md
```

## RSS And Revalidation

RSS feeds:

```txt
/rss.xml
/notes/rss.xml
```

Implementation:

```txt
frontend/lib/rss.ts
frontend/app/rss.xml/route.ts
frontend/app/(public)/notes/rss.xml/route.ts
```

The feeds read site name, description, owner, and email from `getProfileContent()`, so changing `frontend/content/site/profile.json` or the CMS profile response updates RSS output.

Immediate revalidation examples:

```json
{ "type": "post", "slug": "my-post-slug" }
{ "type": "note", "slug": "my-note-slug" }
{ "type": "profile" }
```

## Backend Entry Points

```txt
backend/package.json
backend/pnpm-lock.yaml
backend/tsconfig.json
backend/src/server.ts
backend/src/config.ts
backend/src/db.ts
backend/src/mailer.ts
backend/src/notifier.ts
backend/src/tokens.ts
backend/src/routes/messages.ts
backend/src/routes/comments.ts
backend/src/routes/replies.ts
backend/migrations/001_init.sql
```

Main commands:

```bash
cd backend
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm typecheck
```

## Backend Environment

```txt
backend/.env.example
```

Important variables:

```env
BACKEND_PORT=4000
BACKEND_BASE_URL=http://localhost:4000
PUBLIC_SITE_URL=http://localhost:3000
DATABASE_PATH=./data/blog.sqlite
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_STARTTLS=true
SMTP_AUTH=true
SMTP_FROM=
CONTACT_NOTIFY_TO=
FEISHU_WEBHOOK_URL=
WECOM_WEBHOOK_URL=
REPLY_TOKEN_SECRET=
```

## Excluded From Archive

```txt
node_modules/
.next/
dist/
data/
.pnpm-store/
.playwright-mcp/
.turbo/
.cache/
.DS_Store
*.tsbuildinfo
*.log
.env
*.sqlite
*.sqlite-*
```

The archive keeps `.env.example` files but excludes real `.env` files.
