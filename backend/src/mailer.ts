import nodemailer from "nodemailer"
import { config, requireMailerConfig } from "./config.js"

type OwnerNotificationInput = {
  kind: "message" | "comment"
  name: string
  email?: string | null
  subject: string
  body: string
  replyUrl: string
}

export async function sendOwnerNotification(input: OwnerNotificationInput): Promise<void> {
  requireMailerConfig()
  const transporter = createTransporter()

  await transporter.sendMail({
    from: config.smtpFrom,
    to: config.contactNotifyTo,
    replyTo: input.email ?? undefined,
    subject: `[self-blog] ${input.subject || `New ${input.kind}`}`,
    text: [
      `Type: ${input.kind}`,
      `From: ${input.name}${input.email ? ` <${input.email}>` : ""}`,
      `Subject: ${input.subject}`,
      "",
      input.body,
      "",
      `Reply URL: ${input.replyUrl}`,
    ].join("\n"),
  })
}

export async function sendVisitorReply(to: string, subject: string, body: string): Promise<void> {
  requireMailerConfig()
  const transporter = createTransporter()

  await transporter.sendMail({
    from: config.smtpFrom,
    to,
    subject,
    text: body,
  })
}

function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465 && !config.smtpStarttls,
    requireTLS: config.smtpStarttls,
    tls: config.smtpTlsServername
      ? {
          servername: config.smtpTlsServername,
        }
      : undefined,
    auth: config.smtpAuth
      ? {
          user: config.smtpUser,
          pass: config.smtpPass,
        }
      : undefined,
  })
}
