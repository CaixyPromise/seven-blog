const IMAGE_HOST_ENV_KEYS = ["IMAGE_ALLOWED_HOSTS", "NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS"] as const

/**
 * Reads the image host allowlist on the server so it can be changed through
 * deployment configuration without rebuilding the client bundle.
 */
export function getConfiguredImageHosts() {
  for (const key of IMAGE_HOST_ENV_KEYS) {
    const value = process.env[key]
    if (value !== undefined) {
      return parseImageHosts(value)
    }
  }

  return []
}

export function parseImageHosts(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((host) => normalizeImageHost(host))
        .filter((host): host is string => Boolean(host)),
    ),
  )
}

function normalizeImageHost(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
    return url.hostname.toLowerCase()
  } catch {
    return null
  }
}
