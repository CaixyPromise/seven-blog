import { generateLlmsIndex } from "@/lib/llms"

export async function GET() {
  return new Response(await generateLlmsIndex(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
