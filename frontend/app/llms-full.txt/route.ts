import { generateLlmsFull } from "@/lib/llms"

export async function GET() {
  return new Response(await generateLlmsFull(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
