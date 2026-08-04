FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . ./
RUN pnpm run build

FROM base AS runner

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 blog \
  && useradd --system --uid 1001 --gid blog blog \
  && mkdir -p /app/data \
  && chown -R blog:blog /app

COPY --from=builder --chown=blog:blog /app/node_modules ./node_modules
COPY --from=builder --chown=blog:blog /app/package.json ./package.json
COPY --from=builder --chown=blog:blog /app/dist ./dist
COPY --from=builder --chown=blog:blog /app/migrations ./migrations

USER blog

EXPOSE 4000
CMD ["node", "dist/server.js"]
