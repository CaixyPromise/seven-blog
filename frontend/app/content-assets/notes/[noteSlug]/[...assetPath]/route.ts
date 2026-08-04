import { notFound } from "next/navigation"
import { connection } from "next/server"
import { getContentAssetResponse } from "@/lib/content/content-assets"

interface ContentAssetProps {
  params: Promise<{ noteSlug: string; assetPath: string[] }>
}

export async function GET(_request: Request, { params }: ContentAssetProps) {
  await connection()
  const { noteSlug, assetPath } = await params
  const response = await getContentAssetResponse("notes", noteSlug, assetPath)
  if (!response) {
    notFound()
  }

  return response
}
