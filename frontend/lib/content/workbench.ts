import { cacheFileContent } from "./file-cache"
import { getContentSource } from "./source"
import type { WorkbenchActivity, WorkbenchItem } from "./types"

export type { WorkbenchActivity, WorkbenchItem }

export async function listWorkbenchItems(): Promise<WorkbenchItem[]> {
  return cacheFileContent(
    { key: ["workbench", "items"], tags: ["workbench", "llms"], revalidate: 600 },
    () => getContentSource().listWorkbenchItems(),
  )
}

export async function listWorkbenchActivity(): Promise<WorkbenchActivity[]> {
  return cacheFileContent(
    { key: ["workbench", "activity"], tags: ["workbench", "llms"], revalidate: 300 },
    () => getContentSource().listWorkbenchActivity(),
  )
}
