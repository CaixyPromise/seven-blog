import { expect, test } from "@playwright/test"

const articles = [
  {
    path: "/blog/demo-post",
    title: "A Demo Post",
    excerpt: "A fictional post that demonstrates portable Markdown content.",
  },
  {
    path: "/notes/demo-note",
    title: "A Demo Note",
    excerpt: "A short fictional note for exercising the shared article renderer.",
  },
]

test.describe("article social metadata", () => {
  for (const article of articles) {
    test(`${article.path} exposes its article metadata and share image`, async ({ page, request }) => {
      await page.goto(article.path)

      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", article.title)
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", article.excerpt)

      const pageUrl = new URL(await page.locator('meta[property="og:url"]').getAttribute("content") ?? "")
      expect(pageUrl.pathname).toBe(article.path)

      const imageUrl = new URL(await page.locator('meta[property="og:image"]').getAttribute("content") ?? "")
      expect(imageUrl.pathname).toBe(`${article.path}/opengraph-image`)
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200")
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630")
      await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", article.title)
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", article.title)
      await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", article.excerpt)
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", imageUrl.href)

      const response = await request.get(imageUrl.pathname)
      expect(response.status()).toBe(200)
      expect(response.headers()["content-type"]).toContain("image/png")
      const signature = Buffer.from((await response.body()).subarray(0, 8)).toString("hex")
      expect(signature).toBe("89504e470d0a1a0a")
    })
  }

  test("a missing note share image returns 404", async ({ request }) => {
    const response = await request.get("/notes/does-not-exist/opengraph-image")
    expect(response.status()).toBe(404)
  })
})
