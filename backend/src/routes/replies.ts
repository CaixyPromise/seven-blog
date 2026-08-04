import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { db, nowIso } from "../db.js"
import { sendVisitorReply } from "../mailer.js"
import { markReplyTokenUsed, verifyReplyToken } from "../tokens.js"

type TargetRecord = {
  id: number
  name: string
  email: string | null
  subject: string
  body: string
}

const replySchema = z.object({
  body: z.string().trim().min(1).max(5000),
})

export async function registerReplyRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { token: string } }>("/reply/:token", async (request, reply) => {
    const tokenRecord = verifyReplyToken(request.params.token)
    if (!tokenRecord) {
      return reply.status(410).type("text/html").send(renderMessage("Reply link unavailable", "This reply link is invalid, expired, or already used."))
    }

    const target = getTarget(tokenRecord.targetType, tokenRecord.targetId)
    if (!target) {
      return reply.status(404).type("text/html").send(renderMessage("Message not found", "The original message could not be found."))
    }

    return reply.type("text/html").send(renderReplyForm(request.params.token, target))
  })

  app.post<{ Params: { token: string } }>("/reply/:token", async (request, reply) => {
    const tokenRecord = verifyReplyToken(request.params.token)
    if (!tokenRecord) {
      return reply.status(410).send({ error: "Reply link is invalid, expired, or already used." })
    }

    const parsed = replySchema.safeParse(normalizeReplyBody(request.body))
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid reply payload." })
    }

    const target = getTarget(tokenRecord.targetType, tokenRecord.targetId)
    if (!target) {
      return reply.status(404).send({ error: "Original message was not found." })
    }
    if (!target.email) {
      return reply.status(400).send({ error: "Original sender did not provide an email address." })
    }

    await sendVisitorReply(target.email, `Re: ${target.subject || "Your message"}`, parsed.data.body)
    markReplyTokenUsed(request.params.token)
    markTargetReplied(tokenRecord.targetType, tokenRecord.targetId)

    const acceptsHtml = request.headers.accept?.includes("text/html")
    if (acceptsHtml) {
      return reply.type("text/html").send(renderMessage("Reply sent", "The reply email has been sent."))
    }

    return reply.send({ ok: true })
  })
}

function getTarget(targetType: "message" | "comment", targetId: number): TargetRecord | undefined {
  if (targetType === "message") {
    return db
      .prepare("SELECT id, name, email, subject, body FROM messages WHERE id = ?")
      .get(targetId) as TargetRecord | undefined
  }

  return db
    .prepare("SELECT id, name, email, 'Comment reply' AS subject, body FROM comments WHERE id = ?")
    .get(targetId) as TargetRecord | undefined
}

function markTargetReplied(targetType: "message" | "comment", targetId: number): void {
  const table = targetType === "message" ? "messages" : "comments"
  db.prepare(`UPDATE ${table} SET status = 'replied', updated_at = ? WHERE id = ?`).run(nowIso(), targetId)
}

function normalizeReplyBody(body: unknown): { body: string } {
  if (typeof body === "object" && body !== null && "body" in body) {
    return { body: String((body as { body: unknown }).body ?? "") }
  }

  if (typeof body === "string") {
    const formData = new URLSearchParams(body)
    return { body: formData.get("body") ?? "" }
  }

  return { body: "" }
}

function renderReplyForm(token: string, target: TargetRecord): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reply</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #050505; color: #fafafa; }
    main { width: min(720px, calc(100vw - 32px)); margin: 64px auto; }
    label, textarea, button { display: block; width: 100%; }
    textarea { min-height: 220px; box-sizing: border-box; margin: 12px 0 16px; padding: 12px; border-radius: 8px; border: 1px solid #333; background: #111; color: #fafafa; }
    button { border: 0; border-radius: 8px; padding: 12px 16px; background: #00c896; color: #02110d; font-weight: 700; cursor: pointer; }
    pre { white-space: pre-wrap; color: #aaa; background: #101010; padding: 16px; border-radius: 8px; }
  </style>
</head>
<body>
  <main>
    <h1>Reply to ${escapeHtml(target.name)}</h1>
    <pre>${escapeHtml(target.body)}</pre>
    <form method="post" action="/reply/${encodeURIComponent(token)}">
      <label for="body">Reply email</label>
      <textarea id="body" name="body" required></textarea>
      <button type="submit">Send reply</button>
    </form>
  </main>
</body>
</html>`
}

function renderMessage(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title></head><body><main style="font-family: system-ui; max-width: 680px; margin: 64px auto;"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p></main></body></html>`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }
    return map[char] ?? char
  })
}
