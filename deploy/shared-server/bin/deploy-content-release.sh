#!/usr/bin/env bash
set -euo pipefail

source /app/caixypromise/seven-blog/service/bin/lib.sh

load_env_file "$SERVICE_ROOT/deploy-webhook.env"
load_env_file "$SERVICE_ROOT/content.env"
load_env_file "$SERVICE_ROOT/frontend.env"

require_bearer_token "${CONTENT_WEBHOOK_TOKEN:-}" "${REQUEST_AUTHORIZATION:-}"

repository="${1:-}"
commit="${2:-}"
ref="${3:-main}"

[[ "$repository" == "${CONTENT_REPOSITORY:-git@github.com:CaixyPromise/seven-blog-content.git}" ]] || fail "unexpected content repository"
validate_commit "$commit"
[[ "$ref" == "${CONTENT_REPOSITORY_REF:-main}" ]] || fail "unexpected content ref"
[[ -f "${CONTENT_REPOSITORY_KEY:?CONTENT_REPOSITORY_KEY is required}" ]] || fail "content deploy key is missing"
[[ -f "${CONTENT_KNOWN_HOSTS:?CONTENT_KNOWN_HOSTS is required}" ]] || fail "content known_hosts is missing"

mkdir -p "$CONTENT_ROOT/releases"
chmod 755 "$CONTENT_ROOT" "$CONTENT_ROOT/releases"
exec 9>"$STATE_ROOT/content-deploy.lock"
flock -n 9 || fail "another content deployment is running"

release_path="$CONTENT_ROOT/releases/$commit"
if [[ ! -d "$release_path" ]]; then
  staging_path="$(mktemp -d "$CONTENT_ROOT/.staging.XXXXXX")"
  cleanup_staging() { rm -rf "$staging_path"; }
  trap cleanup_staging EXIT

  export GIT_SSH_COMMAND="ssh -i $CONTENT_REPOSITORY_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$CONTENT_KNOWN_HOSTS"
  log "fetching content release $commit"
  git clone --no-checkout "$repository" "$staging_path" >/dev/null
  git -C "$staging_path" fetch --depth=1 origin "$commit" >/dev/null
  git -C "$staging_path" checkout --detach "$commit" >/dev/null

  actual_commit="$(git -C "$staging_path" rev-parse HEAD)"
  [[ "$actual_commit" == "$commit" ]] || fail "fetched commit does not match request"

  for required_file in \
    site/profile.prod.json \
    site/profile.en.prod.json \
    site/home.prod.json \
    site/home.en.prod.json \
    site/introduction.prod.json \
    site/introduction.en.prod.json \
    site/navigation.prod.json \
    projects/projects.prod.json \
    workbench/items.prod.json \
    workbench/activity.prod.json; do
    [[ -f "$staging_path/$required_file" ]] || fail "missing content file: $required_file"
  done
  [[ -d "$staging_path/posts" ]] || fail "missing posts directory"
  [[ -d "$staging_path/notes" ]] || fail "missing notes directory"

  rm -rf "$staging_path/.git"
  mv "$staging_path" "$release_path"
  # The checkout may be created with the deploy user's restrictive umask.
  # The frontend reads the external volume as an unprivileged container user,
  # so expose content as read-only to other users without granting write access.
  chmod -R u+rwX,go+rX "$release_path"
  trap - EXIT
fi

remember_previous_content_target
activate_content_target "releases/$commit"

revalidate() {
  [[ -n "${REVALIDATE_SECRET:-}" ]] || fail "REVALIDATE_SECRET is not configured"
  curl -fsS --retry 3 --retry-delay 1 --max-time 30 \
    -X POST "${REVALIDATE_URL:-https://blog.caixyowo.cn/api/revalidate}" \
    -H "Authorization: Bearer $REVALIDATE_SECRET" \
    -H 'Content-Type: application/json' \
    -d '{"type":"content"}' >/dev/null
}

if ! revalidate; then
  log "revalidation failed; restoring previous content release" >&2
  if [[ -L "$CONTENT_ROOT/previous" ]]; then
    previous_target="$(readlink "$CONTENT_ROOT/previous")"
    activate_content_target "$previous_target"
    revalidate || true
  else
    rm -f "$CONTENT_ROOT/current"
  fi
  fail "content rollout failed"
fi

log "content release $commit is active"
