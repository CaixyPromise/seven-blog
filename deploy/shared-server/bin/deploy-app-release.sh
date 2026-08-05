#!/usr/bin/env bash
set -euo pipefail

source /app/caixypromise/seven-blog/service/bin/lib.sh

load_env_file "$SERVICE_ROOT/deploy-webhook.env"
load_env_file "$SERVICE_ROOT/ghcr.env"

require_bearer_token "${APP_WEBHOOK_TOKEN:-}" "${REQUEST_AUTHORIZATION:-}"

repository="${1:-}"
commit="${2:-}"
frontend_image="${3:-}"
backend_image="${4:-}"
frontend_digest="${5:-}"
backend_digest="${6:-}"

[[ "$repository" == "${APP_REPOSITORY:-CaixyPromise/seven-blog}" ]] || fail "unexpected repository"
validate_commit "$commit"
[[ "$frontend_image" == "ghcr.io/caixypromise/seven-blog-frontend" ]] || fail "unexpected frontend image"
[[ "$backend_image" == "ghcr.io/caixypromise/seven-blog-backend" ]] || fail "unexpected backend image"
validate_digest "$frontend_digest"
validate_digest "$backend_digest"

exec 9>"$STATE_ROOT/app-deploy.lock"
flock -n 9 || fail "another application deployment is running"

candidate_env="$(mktemp "$STATE_ROOT/.app-env.XXXXXX")"
trap 'rm -f "$candidate_env"' EXIT

printf '%s\n' \
  "FRONTEND_IMAGE=$frontend_image" \
  "FRONTEND_DIGEST=$frontend_digest" \
  "BACKEND_IMAGE=$backend_image" \
  "BACKEND_DIGEST=$backend_digest" \
  "RELEASE_ID=$commit" > "$candidate_env"
chmod 600 "$candidate_env"

had_current=0
if [[ -f "$APP_ENV" ]]; then
  had_current=1
  cp "$APP_ENV" "$STATE_ROOT/previous.env"
fi

cp "$candidate_env" "$STATE_ROOT/releases/$commit.env"
mv -f "$candidate_env" "$APP_ENV"

restore_previous() {
  log "restoring previous application release"
  if [[ "$had_current" == 1 && -f "$STATE_ROOT/previous.env" ]]; then
    cp "$STATE_ROOT/previous.env" "$APP_ENV"
    compose up -d --remove-orphans >/dev/null
  else
    compose down --remove-orphans >/dev/null 2>&1 || true
  fi
}

if [[ -n "${GHCR_TOKEN:-}" ]]; then
  printf '%s' "$GHCR_TOKEN" | docker login "${GHCR_REGISTRY:-ghcr.io}" --username "${GHCR_USERNAME:?GHCR_USERNAME is required}" --password-stdin >/dev/null
fi

log "pulling application release $commit"
if ! compose config --quiet || ! compose pull || ! compose up -d --remove-orphans; then
  restore_previous
  fail "application rollout failed"
fi

if ! wait_for_blog; then
  compose ps >&2 || true
  restore_previous
  fail "application health check failed"
fi

cp "$APP_ENV" "$STATE_ROOT/current.env"
log "application release $commit is healthy"
