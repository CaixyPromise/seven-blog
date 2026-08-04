import { createOgImage } from "@/lib/og/image-response"

export function GET() {
  return createOgImage({
    eyebrow: "CaixyPromise Blog",
    title: "Technical articles about AI Agents, LLM applications, and backend systems.",
    footer: "eindev.ir/blog",
  })
}
