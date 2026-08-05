#!/usr/bin/env bash
set -euo pipefail

source /app/caixypromise/seven-blog/service/bin/lib.sh

[[ -f "$STATE_ROOT/previous.env" ]] || fail "no previous application release"

exec 9>"$STATE_ROOT/app-deploy.lock"
flock -n 9 || fail "another application deployment is running"

cp "$STATE_ROOT/previous.env" "$APP_ENV"
compose up -d --remove-orphans
wait_for_blog || fail "rolled back application is unhealthy"
cp "$APP_ENV" "$STATE_ROOT/current.env"
log "application rollback completed"
