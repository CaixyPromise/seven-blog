#!/usr/bin/env bash
set -euo pipefail

release_id="${1:?release id is required}"
store_root="${CONTENT_STORE_ROOT:-/srv/seven-blog-content}"
release_path="$store_root/releases/$release_id"
current_link="$store_root/current"
previous_link="$store_root/previous"

case "$release_id" in
  *[!a-zA-Z0-9._-]*|'') echo "invalid release id" >&2; exit 1 ;;
esac

test -d "$release_path"
mkdir -p "$store_root/releases"

if previous_target="$(readlink "$current_link" 2>/dev/null)"; then
  ln -sfn "$previous_target" "$previous_link"
fi

next_link="$store_root/.current-$release_id"
ln -s "releases/$release_id" "$next_link"
mv -Tf "$next_link" "$current_link"
