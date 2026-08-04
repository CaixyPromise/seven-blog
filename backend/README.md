# Self Blog Interaction Backend

Small Node backend for contact messages, private comments, reply URLs, and owner notifications.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm run dev
```

With pnpm 10, approve the native SQLite dependency if prompted:

```bash
pnpm approve-builds
pnpm rebuild better-sqlite3
```

## Environment

```env
BACKEND_PORT=4000
BACKEND_BASE_URL=http://localhost:4000
PUBLIC_SITE_URL=http://localhost:3000
DATABASE_PATH=./data/blog.sqlite

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_STARTTLS=true
SMTP_AUTH=true
SMTP_TLS_SERVERNAME=
SMTP_FROM=
CONTACT_NOTIFY_TO=

FEISHU_WEBHOOK_URL=
WECOM_WEBHOOK_URL=
REPLY_TOKEN_SECRET=
```

`SMTP_HOST`, `SMTP_FROM`, `CONTACT_NOTIFY_TO`, and SMTP credentials are required when `SMTP_AUTH=true`. The backend also accepts the legacy `SMTP_USER` and `SMTP_PASS` names. Without valid mail configuration, `/messages` and `/comments` store the record, create a reply token, record the failed notification, and return a clear `503` error.

When `SMTP_HOST` is a private IP but the certificate is issued to a DNS name, set `SMTP_TLS_SERVERNAME` to that certificate name. This keeps TCP traffic on the private network while retaining TLS certificate verification.

## Endpoints

```txt
GET /health
POST /messages
POST /comments
GET /reply/:token
POST /reply/:token
```

Reply tokens expire after seven days and are marked used after a successful reply.
