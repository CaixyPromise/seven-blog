#!/usr/bin/env bash
set -euo pipefail

source /app/caixypromise/seven-blog/service/bin/lib.sh
load_env_file "$SERVICE_ROOT/frontend.env"

[[ -L "$CONTENT_ROOT/previous" ]] || fail "no previous content release"

exec 9>"$STATE_ROOT/content-deploy.lock"
flock -n 9 || fail "another content deployment is running"

previous_target="$(readlink "$CONTENT_ROOT/previous")"
activate_content_target "$previous_target"

curl -fsS --retry 3 --retry-delay 1 --max-time 30 \
  -X POST "${REVALIDATE_URL:-https://blog.caixyowo.cn/api/revalidate}" \
  -H "Authorization: Bearer ${REVALIDATE_SECRET:?REVALIDATE_SECRET is required}" \
  -H 'Content-Type: application/json' \
  -d '{"type":"content"}' >/dev/null

log "content rollback completed"
