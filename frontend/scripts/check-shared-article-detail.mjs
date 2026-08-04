import fs from "node:fs"
import path from "node:path"

const routes = [
  "app/(public)/blog/[postSlug]/page.tsx",
  "app/(public)/notes/[noteSlug]/page.tsx",
]

const expectedComponent = "ArticlePageContent"
const expectedSource = "@/components/public/blog/article-page-content"

const results = routes.map((route) => {
  const source = fs.readFileSync(path.join(process.cwd(), route), "utf8")
  const importPattern = new RegExp(
    `import\\s+\\{\\s*${expectedComponent}\\s*\\}\\s+from\\s+["']${expectedSource}["']`,
  )
  const renderPattern = new RegExp(`<${expectedComponent}\\b`)

  return {
    route,
    importsSharedComponent: importPattern.test(source),
    rendersSharedComponent: renderPattern.test(source),
  }
})

const failures = results.filter(
  ({ importsSharedComponent, rendersSharedComponent }) =>
    !importsSharedComponent || !rendersSharedComponent,
)

if (failures.length > 0) {
  console.error("Blog and notes must render the same top-level article detail component.")
  console.error(JSON.stringify(failures, null, 2))
  process.exit(1)
}

console.log("Blog and notes share ArticlePageContent.")
