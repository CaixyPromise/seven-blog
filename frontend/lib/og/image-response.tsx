import { ImageResponse } from "next/og"

export const ogImageSize = {
  width: 1200,
  height: 630,
}

interface OgImageOptions {
  eyebrow: string
  title: string
  subtitle?: string
  footer: string
}

export function createOgImage({ eyebrow, title, subtitle, footer }: OgImageOptions): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #050807 0%, #081711 55%, #0b241b 100%)",
          color: "#f5f5f5",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ color: "#16d19a", fontSize: 28, fontWeight: 700 }}>{eyebrow}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 980, fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          {subtitle ? (
            <div style={{ marginTop: 28, maxWidth: 920, color: "#cbd5e1", fontSize: 30, lineHeight: 1.25 }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div style={{ color: "#9ca3af", fontSize: 26 }}>{footer}</div>
      </div>
    ),
    ogImageSize,
  )
}
