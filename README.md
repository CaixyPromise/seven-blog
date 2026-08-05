# CaixyPromise Blog

The public application source for CaixyPromise Blog. It includes the Next.js frontend, the Node interaction backend, deployment templates, schemas, and a fully synthetic content fixture.

## Local development

```bash
pnpm --dir frontend install
pnpm --dir frontend dev
```

Without `CONTENT_ROOT`, the frontend reads `frontend/content-demo/` with `CONTENT_ENV=dev`. The demo content is safe to publish and does not contain the production profile, posts, or notes.

## Production content

Production content is maintained in a separate private repository and mounted read-only at runtime. Set:

```env
CONTENT_ROOT=/content-store/current
CONTENT_ENV=prod
```

See `frontend/docs/external-content-deployment.md` for the release workflow.

## Docker images and content mount

The public Compose file supports both published GHCR images and local source
builds. Published image defaults are:

```text
ghcr.io/caixypromise/seven-blog-frontend:latest
ghcr.io/caixypromise/seven-blog-backend:latest
```

To use the published images:

```bash
docker compose pull
docker compose up -d --no-build
```

To build from this repository instead:

```bash
docker compose up -d --build
```

The frontend never stores production content in the image. Compose mounts the
synthetic `frontend/content-demo` directory read-only by default. Provide a
different content source for a private or self-hosted deployment:

```bash
CONTENT_STORE_HOST_PATH=/path/to/content \
CONTENT_ROOT=/content-store \
CONTENT_ENV=dev \
docker compose up -d --no-build
```

Production deployments should mount a release store and use
`CONTENT_ROOT=/content-store/current` with `CONTENT_ENV=prod`. SMTP settings,
revalidation secrets, SQLite data, private content, and deployment credentials
are runtime mounts or environment files and are intentionally excluded from
the image build contexts.
