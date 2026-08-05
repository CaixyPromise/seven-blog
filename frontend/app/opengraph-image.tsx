import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050807",
          color: "#f5f5f5",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", color: "#16d19a", fontSize: 28 }}>
          <span>CaixyPromise</span>
          <span>CaixyPromise Blog</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 24, color: "#16d19a", fontSize: 30 }}>Maverick / CaixyPromise</div>
          <div style={{ maxWidth: 920, fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            Notes on AI Agents, LLM applications, backend systems, and tools.
          </div>
        </div>
        <div style={{ color: "#9ca3af", fontSize: 26 }}>example.com</div>
      </div>
    ),
    size,
  )
}
