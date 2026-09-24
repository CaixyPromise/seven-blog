# External Content Deployment

The frontend image does not include `content/`. At runtime it reads the directory named by `CONTENT_ROOT`.

## Content environment

Structured content files are selected by `CONTENT_ENV`. The public code repository uses `dev`; the private production content repository uses `prod`.

```txt
site/profile.dev.json
site/profile.en.dev.json
site/profile.prod.json
site/profile.en.prod.json
projects/projects.prod.json
workbench/items.prod.json
```

`CONTENT_ENV` is independent from `NODE_ENV`. If it is omitted, Node production maps to `prod` and other modes map to `dev`. Production does not fall back to an unqualified `.json` file, so a missing `*.prod.json` fails clearly instead of publishing demo content.

## Runtime layout

On the server, keep content releases outside the application checkout:

```txt
/srv/seven-blog-content/
  releases/<commit-sha>/
  current -> releases/<commit-sha>
  previous -> releases/<previous-sha>
```

Before the first deployment, create the content store and persistent SQLite directory with ownership matching the containers:

```bash
sudo install -d -o 1001 -g 1001 /srv/seven-blog-content/releases
sudo install -d -o 1001 -g 1001 /srv/seven-blog/data
```

The content repository root must contain the existing content shape:

```txt
site/
posts/
notes/
projects/
workbench/
```

Compose mounts the parent directory read-only at `/content-store`; the frontend uses:

```env
CONTENT_SOURCE=file
CONTENT_ROOT=/content-store/current
CONTENT_ENV=prod
IMAGE_ALLOWED_HOSTS=cdn.example.com,images.example.net
```

Create `deploy/frontend.env` and `deploy/backend.env` from their `.example` files before starting Compose. Set `IMAGE_ALLOWED_HOSTS` there for any remote image CDN used by the private content repository. `NEXT_PUBLIC_SITE_URL` and `BACKEND_BASE_URL` must use the public HTTPS domain.

## Content publishing

The example workflow at `deploy/content-publish.yml.example` belongs in the private content repository. It performs this sequence:

1. Check out the content repository and the frontend runtime repository.
2. Run `CONTENT_ROOT=$GITHUB_WORKSPACE pnpm --dir site-runtime/frontend content:check`.
3. Upload content to `/srv/seven-blog-content/releases/<commit-sha>/`.
4. Atomically update `current` with `activate-content-release.sh`.
5. Run `revalidate-content-diff.mjs` against `CONTENT_GIT_BASE` and `CONTENT_GIT_HEAD`.
6. Roll back `current` to `previous` if revalidation fails.

Required CI secrets:

```txt
CONTENT_REPO_DEPLOY_KEY       Read-only key used to check out the runtime repository.
CONTENT_DEPLOY_TARGET         SSH target for the deployment host.
CONTENT_DEPLOY_SSH_KEY        Deployment-only SSH private key.
CONTENT_REVALIDATE_URL        https://your-domain/api/revalidate
REVALIDATE_SECRET             Must match deploy/frontend.env.
```

The frontend and backend containers do not receive any Git private key. The content mount is read-only.

## Mail transport

The interaction backend is the only component that sends mail. Deploy it on `hk-server`, or another host whose outbound traffic is routed through the HK WireGuard/Tailscale network. Do not send mail from the browser or the frontend container, and do not expose SMTP credentials in client-side environment variables.

## Reverse proxy

Route public traffic to the frontend container and map `/interaction/` to the backend container, stripping the `/interaction` prefix before it reaches Fastify. Keep `/api/revalidate` and `/api/llms/*` on the Next.js frontend; do not proxy all `/api/*` paths to the interaction backend.
