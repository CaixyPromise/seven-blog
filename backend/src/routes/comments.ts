import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { config } from "../config.js"
import { db, nowIso } from "../db.js"
import { notifyOwner } from "../notifier.js"
import { createReplyToken } from "../tokens.js"

const commentSchema = z.object({
  postSlug: z.string().trim().min(1).max(180),
  parentId: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(240).optional(),
  body: z.string().trim().min(1).max(5000),
})

export async function registerCommentRoutes(app: FastifyInstance): Promise<void> {
  app.post("/comments", async (request, reply) => {
    const parsed = commentSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid comment payload." })
    }

    const now = nowIso()
    const result = db
      .prepare(
        `INSERT INTO comments (post_slug, parent_id, name, email, body, status, created_at, updated_at)
         VALUES (@postSlug, @parentId, @name, @email, @body, 'pending', @createdAt, @updatedAt)`,
      )
      .run({
        ...parsed.data,
        parentId: parsed.data.parentId ?? null,
        email: parsed.data.email ?? null,
        createdAt: now,
        updatedAt: now,
      })

    const id = Number(result.lastInsertRowid)
    const token = createReplyToken("comment", id)
    const replyUrl = `${config.backendBaseUrl.replace(/\/$/, "")}/reply/${token.token}`

    try {
      await notifyOwner({
        targetType: "comment",
        targetId: id,
        name: parsed.data.name,
        email: parsed.data.email,
        subject: `Comment on ${parsed.data.postSlug}`,
        body: parsed.data.body,
        replyUrl,
      })
    } catch (error) {
      return reply.status(503).send({
        error: error instanceof Error ? error.message : "Notification failed.",
        id,
      })
    }

    return reply.status(201).send({ ok: true, id, status: "pending" })
  })
}
