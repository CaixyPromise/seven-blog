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
