import { db, nowIso } from "./db.js"
import { config } from "./config.js"
import { sendOwnerNotification } from "./mailer.js"

type NotifyOwnerInput = {
  targetType: "message" | "comment"
  targetId: number
  name: string
  email?: string | null
  subject: string
  body: string
  replyUrl: string
}

export async function notifyOwner(input: NotifyOwnerInput): Promise<void> {
  await recordAttempt(input.targetType, input.targetId, "email", () =>
    sendOwnerNotification({
      kind: input.targetType,
      name: input.name,
      email: input.email,
      subject: input.subject,
      body: input.body,
      replyUrl: input.replyUrl,
    }),
  )

  if (config.feishuWebhookUrl) {
    await recordAttempt(input.targetType, input.targetId, "feishu", () =>
      postWebhook(config.feishuWebhookUrl, {
        msg_type: "text",
        content: { text: formatWebhookText(input) },
      }),
    )
  }

  if (config.wecomWebhookUrl) {
    await recordAttempt(input.targetType, input.targetId, "wecom", () =>
      postWebhook(config.wecomWebhookUrl, {
        msgtype: "text",
        text: { content: formatWebhookText(input) },
      }),
    )
  }
}

async function recordAttempt(
  targetType: string,
  targetId: number,
  channel: string,
  action: () => Promise<void>,
): Promise<void> {
  try {
    await action()
    insertNotification(targetType, targetId, channel, "sent")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    insertNotification(targetType, targetId, channel, "failed", message)
    throw error
  }
}

function insertNotification(targetType: string, targetId: number, channel: string, status: string, error?: string): void {
  db.prepare(
    `INSERT INTO notifications (target_type, target_id, channel, status, error, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(targetType, targetId, channel, status, error ?? null, nowIso())
}

async function postWebhook(url: string, payload: unknown): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }
}

function formatWebhookText(input: NotifyOwnerInput): string {
  return [
    `New ${input.targetType} from ${input.name}`,
    input.email ? `Email: ${input.email}` : undefined,
    input.subject ? `Subject: ${input.subject}` : undefined,
    "",
    input.body,
    "",
    `Reply: ${input.replyUrl}`,
  ]
    .filter(Boolean)
    .join("\n")
}
