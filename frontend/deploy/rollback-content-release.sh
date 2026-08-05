#!/usr/bin/env bash
set -euo pipefail

store_root="${CONTENT_STORE_ROOT:-/srv/seven-blog-content}"
previous_target="$(readlink "$store_root/previous")"
test -n "$previous_target"

next_link="$store_root/.current-rollback"
ln -s "$previous_target" "$next_link"
mv -Tf "$next_link" "$store_root/current"
