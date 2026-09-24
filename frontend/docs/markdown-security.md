# Markdown Security Policy

The blog renders Markdown with `react-markdown`, `remark-gfm`, `remark-math`, `rehype-raw`, `rehype-sanitize`, and `rehype-katex`.

## Pipeline

```txt
Markdown
-> remark-gfm
-> remark-math
-> rehype-raw
-> rehype-sanitize(markdownSanitizeSchema)
-> rehype-katex
-> React components
```

`rehype-raw` is enabled so existing Markdown files can use common HTML blocks. Sanitization must remain enabled before content is accepted from a CMS.

## Allowed HTML

The allowlist is defined in `components/public/blog/markdown-sanitize.ts`.

Allowed categories:

- Basic prose: headings, paragraphs, links, lists, blockquote, code, tables.
- Disclosure UI: `details`, `summary`.
- Media: `img`, `picture`, `video`, `audio`, `source`.
- Embeds: `iframe` with restricted attributes.
- Semantic helpers: `figure`, `figcaption`, `dl`, `dt`, `dd`, `mark`, `kbd`, `samp`.

## Blocked HTML

The sanitizer removes dangerous or unsupported content such as:

- Script execution: `script`, inline event handlers like `onclick` and `onload`.
- Unreviewed protocols in links or media.
- Arbitrary iframe event handlers or script hooks.

## Iframe Rules

Iframe is allowed for controlled embeds, but only selected attributes are preserved:

- `src`
- `title`
- `width`
- `height`
- `allow`
- `allowFullScreen`
- `loading`
- `referrerPolicy`
- `sandbox`
- `className`

When the content source becomes a CMS, iframe hosts should be validated server-side before publishing.

## Image Rules

Local images are preferred.

- Absolute local paths resolve from `public/`.
- Relative paths like `./images/demo.svg` resolve through `/content-assets/posts/:slug/...` for blog posts and `/content-assets/notes/:slug/...` for notes.
- Remote image hosts are supplied by the runtime `IMAGE_ALLOWED_HOSTS` environment variable as a comma-separated hostname list. The public repository does not hard-code deployment-specific CDN domains.
- Missing `alt` text is shown in the page and reported by `pnpm content:check`.

Example private deployment configuration:

```env
IMAGE_ALLOWED_HOSTS=cdn.example.com,images.example.net
```

The frontend reads this variable on the server and passes the normalized host
list to the image component. This means changing the allowlist does not require
putting a personal CDN domain in the open-source renderer. For compatibility,
`NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS` is still accepted as a legacy fallback.

## Required Checks

Run before publishing content:

```bash
IMAGE_ALLOWED_HOSTS=cdn.example.com,images.example.net pnpm content:check
pnpm exec tsc --noEmit
```

`content:check` validates local image paths, remote image hosts, missing image alt text, duplicate heading ids, and that sitemap/LLMS artifacts still read from the domain content layer.
