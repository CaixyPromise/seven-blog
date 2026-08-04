import { createOgImage } from "@/lib/og/image-response"

export function GET() {
  return createOgImage({
    eyebrow: "CaixyPromise Notes",
    title: "Casual notes, fragments, observations, and reflections.",
    footer: "eindev.ir/notes",
  })
}
