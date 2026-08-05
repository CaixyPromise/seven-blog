# shared-server deployment layout

This directory contains the public, secret-free templates for the production
runtime on `shared-server`.

Runtime paths:

```text
/app/caixypromise/seven-blog/
  content/                         # external content releases and symlinks
  service/
    bin/                            # deployment and rollback scripts
    compose.prod.yml                # image-only production Compose file
    hooks.json                      # systemd webhook hook definitions
    frontend.env                    # server-only, not tracked
    backend.env                     # server-only, not tracked
    deploy-webhook.env              # server-only tokens, not tracked
    content.env                     # server-only repository settings, not tracked
    ghcr.env                        # server-only registry credentials, not tracked
    secrets/                        # deploy key and known_hosts
    data/                           # SQLite data
    state/                          # release state and locks
```

The webhook listens on `127.0.0.1:9178`. A separate Nginx route may proxy
exact deployment paths to it; the port itself must not be exposed publicly.

The content repository is checked out on the server with a read-only deploy
key. GitHub Actions should run `content:check` before calling the content
hook; the server hook performs commit, layout, atomic-switch, and revalidation
checks.
