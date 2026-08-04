import path from "node:path"

export function getContentRoot(): string {
  return path.resolve(process.env.CONTENT_ROOT ?? path.join(process.cwd(), "content-demo"))
}

export function getContentEnvironment(): string {
  const configured = process.env.CONTENT_ENV ?? (process.env.NODE_ENV === "production" ? "prod" : "dev")
  const environment = configured === "production" ? "prod" : configured === "development" ? "dev" : configured

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(environment)) {
    throw new Error(`Invalid CONTENT_ENV: ${configured}`)
  }

  return environment
}

export function resolveContentPath(relativePath = ""): string {
  const contentRoot = getContentRoot()
  const resolvedPath = path.resolve(contentRoot, relativePath)

  if (resolvedPath !== contentRoot && !resolvedPath.startsWith(`${contentRoot}${path.sep}`)) {
    throw new Error(`Content path escapes CONTENT_ROOT: ${relativePath}`)
  }

  return resolvedPath
}
