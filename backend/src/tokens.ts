import crypto from "node:crypto"
import { z } from "zod"
import { config } from "./config.js"
import { db, nowIso } from "./db.js"

const tokenPayloadSchema = z.object({
  nonce: z.string().min(16),
  targetType: z.enum(["message", "comment"]),
  targetId: z.number().int().positive(),
  expiresAt: z.string().datetime(),
})

export type ReplyTokenRecord = {
  token: string
  targetType: "message" | "comment"
  targetId: number
  expiresAt: string
}

export function createReplyToken(targetType: "message" | "comment", targetId: number, ttlHours = 24 * 7): ReplyTokenRecord {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()
  const payload = {
    nonce: crypto.randomBytes(24).toString("base64url"),
    targetType,
    targetId,
    expiresAt,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = sign(encodedPayload)
  const token = `${encodedPayload}.${signature}`

  db.prepare(
    `INSERT INTO reply_tokens (token, target_type, target_id, expires_at, created_at)
     VALUES (@token, @targetType, @targetId, @expiresAt, @createdAt)`,
  ).run({
    token,
    targetType,
    targetId,
    expiresAt,
    createdAt: nowIso(),
  })

  return { token, targetType, targetId, expiresAt }
}

export function verifyReplyToken(token: string): ReplyTokenRecord | undefined {
  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return undefined
  }

  const row = db
    .prepare(
      `SELECT token, target_type AS targetType, target_id AS targetId, expires_at AS expiresAt, used_at AS usedAt
       FROM reply_tokens
       WHERE token = ?`,
    )
    .get(token) as (ReplyTokenRecord & { usedAt: string | null }) | undefined

  if (!row || row.usedAt || Date.parse(row.expiresAt) <= Date.now()) {
    return undefined
  }

  const parsedPayload = parseTokenPayload(encodedPayload)
  if (!parsedPayload.success) {
    return undefined
  }

  if (
    parsedPayload.data.targetType !== row.targetType ||
    parsedPayload.data.targetId !== row.targetId ||
    parsedPayload.data.expiresAt !== row.expiresAt
  ) {
    return undefined
  }

  return row
}

export function markReplyTokenUsed(token: string): void {
  db.prepare("UPDATE reply_tokens SET used_at = ? WHERE token = ?").run(nowIso(), token)
}

function sign(encodedPayload: string): string {
  return crypto.createHmac("sha256", config.replyTokenSecret).update(encodedPayload).digest("base64url")
}

function parseTokenPayload(encodedPayload: string): ReturnType<typeof tokenPayloadSchema.safeParse> {
  try {
    return tokenPayloadSchema.safeParse(JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")))
  } catch {
    return tokenPayloadSchema.safeParse(undefined)
  }
}
