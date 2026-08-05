import { createOgImage } from "@/lib/og/image-response"

export function GET() {
  return createOgImage({
    eyebrow: "CaixyPromise Projects",
    title: "Seven Agent and Xiaozhi open-source AI chatbot infrastructure.",
    footer: "example.com/projects",
  })
}
