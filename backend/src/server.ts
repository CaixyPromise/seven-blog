import cors from "@fastify/cors"
import formbody from "@fastify/formbody"
import Fastify from "fastify"
import { config } from "./config.js"
import "./db.js"
import { registerCommentRoutes } from "./routes/comments.js"
import { registerMessageRoutes } from "./routes/messages.js"
import { registerReplyRoutes } from "./routes/replies.js"

export async function buildServer() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: true,
  })
  await app.register(formbody)

  app.get("/health", async () => ({ ok: true }))

  await registerMessageRoutes(app)
  await registerCommentRoutes(app)
  await registerReplyRoutes(app)

  return app
}

const app = await buildServer()
await app.listen({ port: config.backendPort, host: "0.0.0.0" })
