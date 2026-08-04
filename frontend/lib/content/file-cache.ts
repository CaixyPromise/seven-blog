import { unstable_cache } from "next/cache"
import { connection } from "next/server"
import { getContentEnvironment, getContentRoot } from "./content-root"
import { isFileContentSource } from "./source"

interface FileContentCacheOptions {
  key: string[]
  tags: string[]
  revalidate: number
}

export async function cacheFileContent<T>(
  options: FileContentCacheOptions,
  loader: () => Promise<T>,
): Promise<T> {
  await connection()

  if (!isFileContentSource()) {
    return loader()
  }

  const cachedLoader = unstable_cache(loader, [...options.key, getContentRoot(), getContentEnvironment()], {
    tags: options.tags,
    revalidate: options.revalidate,
  })

  return cachedLoader()
}
