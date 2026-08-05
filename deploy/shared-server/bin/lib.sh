#!/usr/bin/env bash
set -euo pipefail

readonly APP_ROOT="/app/caixypromise/seven-blog"
readonly SERVICE_ROOT="$APP_ROOT/service"
readonly STATE_ROOT="$SERVICE_ROOT/state"
readonly CONTENT_ROOT="$APP_ROOT/content"
readonly COMPOSE_FILE="$SERVICE_ROOT/compose.prod.yml"
readonly APP_ENV="$SERVICE_ROOT/app.env"

mkdir -p "$STATE_ROOT" "$STATE_ROOT/releases"

log() {
  printf '[seven-blog] %s\n' "$*"
}

fail() {
  printf '[seven-blog] ERROR: %s\n' "$*" >&2
  exit 1
}

load_env_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    set -a
    # shellcheck disable=SC1090
    . "$file"
    set +a
  fi
}

require_bearer_token() {
  local expected_token="$1"
  local received_header="${2:-}"

  [[ -n "$expected_token" ]] || fail "deployment token is not configured"
  [[ "$received_header" == "Bearer $expected_token" ]] || fail "unauthorized deployment request"
}

validate_commit() {
  [[ "$1" =~ ^[a-f0-9]{7,64}$ ]] || fail "invalid commit"
}

validate_digest() {
  [[ "$1" =~ ^sha256:[a-f0-9]{64}$ ]] || fail "invalid image digest"
}

compose() {
  docker compose --env-file "$APP_ENV" -f "$COMPOSE_FILE" "$@"
}

wait_for_blog() {
  local attempts=60
  while (( attempts > 0 )); do
    if curl -fsS --max-time 3 http://127.0.0.1:4100/health >/dev/null 2>&1 \
      && curl -fsS --max-time 3 http://127.0.0.1:3100/api/health/content >/dev/null 2>&1; then
      return 0
    fi
    attempts=$((attempts - 1))
    sleep 2
  done
  return 1
}

activate_content_target() {
  local target="$1"
  local link="$CONTENT_ROOT/current"
  local tmp_link="$CONTENT_ROOT/.current.$$"

  ln -s "$target" "$tmp_link"
  mv -Tf "$tmp_link" "$link"
}

remember_previous_content_target() {
  local current_target
  current_target="$(readlink "$CONTENT_ROOT/current" 2>/dev/null || true)"
  [[ -n "$current_target" ]] || return 0

  local tmp_link="$CONTENT_ROOT/.previous.$$"
  ln -s "$current_target" "$tmp_link"
  mv -Tf "$tmp_link" "$CONTENT_ROOT/previous"
}
