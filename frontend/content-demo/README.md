# Demo Content

This directory contains synthetic content used by the public source repository and local development.

Use `CONTENT_ROOT` to point production at the private content repository. Structured JSON files use the `.<CONTENT_ENV>.json` suffix. The public demo uses `dev`; production requires `prod` files and does not fall back to demo data.

Blog and note Markdown frontmatter may include an optional `thumbnail` for social previews. Use a public asset path such as `/brand-mark.png`, an image path relative to the article such as `./images/cover.png`, or an HTTPS CDN URL. When omitted, social previews use the platform logo at `/brand-mark.png`.
