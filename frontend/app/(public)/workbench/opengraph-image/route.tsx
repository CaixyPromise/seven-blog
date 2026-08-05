import { createOgImage } from "@/lib/og/image-response"

export function GET() {
  return createOgImage({
    eyebrow: "CaixyPromise Workbench",
    title: "Active work around AI Agent platforms and LLM infrastructure.",
    footer: "example.com/workbench",
  })
}
