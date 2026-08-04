import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { config } from "../config.js"
import { db, nowIso } from "../db.js"
import { notifyOwner } from "../notifier.js"
import { createReplyToken } from "../tokens.js"

const messageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(240),
  subject: z.string().trim().max(180).optional().default(""),
  body: z.string().trim().min(1).max(5000),
  source: z.string().trim().max(80).optional().default("contact-page"),
})

export async function registerMessageRoutes(app: FastifyInstance): Promise<void> {
  app.post("/messages", async (request, reply) => {
    const parsed = messageSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid message payload." })
    }

    const now = nowIso()
    const result = db
      .prepare(
        `INSERT INTO messages (name, email, subject, body, source, status, created_at, updated_at)
         VALUES (@name, @email, @subject, @body, @source, 'new', @createdAt, @updatedAt)`,
      )
      .run({
        ...parsed.data,
        createdAt: now,
        updatedAt: now,
      })

    const id = Number(result.lastInsertRowid)
    const token = createReplyToken("message", id)
    const replyUrl = `${config.backendBaseUrl.replace(/\/$/, "")}/reply/${token.token}`

    try {
      await notifyOwner({
        targetType: "message",
        targetId: id,
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        body: parsed.data.body,
        replyUrl,
      })
    } catch (error) {
      return reply.status(503).send({
        error: error instanceof Error ? error.message : "Notification failed.",
        id,
      })
    }

    return reply.status(201).send({ ok: true, id })
  })
}
