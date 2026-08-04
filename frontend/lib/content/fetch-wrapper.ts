type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

interface ContentFetchOptions extends NextFetchOptions {
  revalidate?: number | false
  tags?: string[]
}

export class ContentFetchError extends Error {
  status: number
  path: string

  constructor(path: string, status: number, statusText: string) {
    super(`Content API request failed: ${status} ${statusText} (${path})`)
    this.name = "ContentFetchError"
    this.status = status
    this.path = path
  }
}

export function isContentApiEnabled(): boolean {
  return Boolean(process.env.CONTENT_API_BASE_URL)
}

export async function fetchWrapper<T>(path: string, options: ContentFetchOptions = {}): Promise<T> {
  const { revalidate, tags, headers, ...requestOptions } = options
  const requestHeaders = new Headers(headers)
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json")
  }
  const nextOptions = mergeNextOptions(requestOptions.next, { revalidate, tags })

  const res = await fetch(resolveContentApiUrl(path), {
    ...requestOptions,
    headers: requestHeaders,
    next: nextOptions,
  })

  if (!res.ok) {
    throw new ContentFetchError(path, res.status, res.statusText)
  }

  return res.json() as Promise<T>
}

function mergeNextOptions(
  next: NextFetchOptions["next"],
  options: Pick<ContentFetchOptions, "revalidate" | "tags">,
): NextFetchOptions["next"] {
  const tags = mergeTags(next?.tags, options.tags)
  const merged = {
    ...next,
    ...(options.revalidate === undefined ? {} : { revalidate: options.revalidate }),
    ...(tags === undefined ? {} : { tags }),
  }

  return Object.keys(merged).length > 0 ? merged : undefined
}

function mergeTags(left?: string[], right?: string[]): string[] | undefined {
  if (!left && !right) {
    return undefined
  }

  return Array.from(new Set([...(left ?? []), ...(right ?? [])]))
}

export async function fetchWrapperOrMock<T>(
  path: string,
  mockData: T,
  options: ContentFetchOptions = {},
): Promise<T> {
  if (!isContentApiEnabled()) {
    return cloneMockData(mockData)
  }

  return fetchWrapper<T>(path, options)
}

export async function fetchOptionalWrapperOrMock<T>(
  path: string,
  mockData: T | undefined,
  options: ContentFetchOptions = {},
): Promise<T | undefined> {
  if (!isContentApiEnabled()) {
    return cloneMockData(mockData)
  }

  try {
    return await fetchWrapper<T>(path, options)
  } catch (error) {
    if (error instanceof ContentFetchError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

function resolveContentApiUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const baseUrl = process.env.CONTENT_API_BASE_URL
  if (!baseUrl) {
    throw new Error("CONTENT_API_BASE_URL is not configured")
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  if (/^https?:\/\//.test(baseUrl)) {
    return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`
  }

  if (baseUrl.startsWith("/")) {
    return `${getServerOrigin()}${baseUrl.replace(/\/$/, "")}${normalizedPath}`
  }

  throw new Error(`CONTENT_API_BASE_URL must be absolute or root-relative: ${baseUrl}`)
}

function getServerOrigin(): string {
  if (process.env.CONTENT_API_ORIGIN) {
    return process.env.CONTENT_API_ORIGIN.replace(/\/$/, "")
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

function cloneMockData<T>(data: T): T {
  if (data === undefined) {
    return data
  }

  return structuredClone(data)
}
