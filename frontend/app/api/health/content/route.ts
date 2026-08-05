import { promises as fs } from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { connection } from "next/server"
import { getContentRoot } from "@/lib/content/content-root"
import { resolveContentConfigPath } from "@/lib/content/file-source"
import { isFileContentSource } from "@/lib/content/source"

export async function GET() {
  await connection()
  if (!isFileContentSource()) {
    return NextResponse.json({ ok: true, source: "api" })
  }

  try {
    await fs.access(path.join(getContentRoot(), await resolveContentConfigPath("site/profile.json")))
    return NextResponse.json({ ok: true, source: "file" })
  } catch {
    return NextResponse.json({ ok: false, source: "file", error: "Content root is unavailable" }, { status: 503 })
  }
}
