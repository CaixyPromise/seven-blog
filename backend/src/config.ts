import dotenv from "dotenv"

dotenv.config()

const backendPort = Number(process.env.BACKEND_PORT ?? 4000)
const smtpUser = process.env.SMTP_USERNAME ?? process.env.SMTP_USER ?? ""
const smtpPass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS ?? ""
const smtpAuth = parseBoolean(process.env.SMTP_AUTH, Boolean(smtpUser))

export const config = {
  backendPort,
  backendBaseUrl: process.env.BACKEND_BASE_URL ?? `http://localhost:${backendPort}`,
  publicSiteUrl: process.env.PUBLIC_SITE_URL ?? "http://localhost:3000",
  databasePath: process.env.DATABASE_PATH ?? "./data/blog.sqlite",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser,
  smtpPass,
  smtpStarttls: parseBoolean(process.env.SMTP_STARTTLS, false),
  smtpAuth,
  smtpTlsServername: process.env.SMTP_TLS_SERVERNAME ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "",
  contactNotifyTo: process.env.CONTACT_NOTIFY_TO ?? "",
  feishuWebhookUrl: process.env.FEISHU_WEBHOOK_URL ?? "",
  wecomWebhookUrl: process.env.WECOM_WEBHOOK_URL ?? "",
  replyTokenSecret: process.env.REPLY_TOKEN_SECRET ?? "local-dev-reply-token-secret",
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase())
}

export function requireMailerConfig(): void {
  const missing = []
  if (!config.smtpHost) missing.push("SMTP_HOST")
  if (!config.smtpFrom) missing.push("SMTP_FROM")
  if (!config.contactNotifyTo) missing.push("CONTACT_NOTIFY_TO")
  if (config.smtpAuth && !config.smtpUser) missing.push("SMTP_USERNAME")
  if (config.smtpAuth && !config.smtpPass) missing.push("SMTP_PASSWORD")

  if (missing.length > 0) {
    throw new Error(`SMTP notification is not configured. Missing: ${missing.join(", ")}`)
  }
}
