import { expect, test } from "@playwright/test"

test.describe("article detail interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/markdown-rendering-kitchen-sink")
  })

  test("code block expands and collapses", async ({ page }) => {
    const expand = page.getByRole("button", { name: "展开代码" }).first()
    await expect(expand).toBeVisible()
    await expand.click()
    await expect(page.getByRole("button", { name: "收起代码" }).first()).toBeVisible()
    await page.getByRole("button", { name: "收起代码" }).first().click()
    await expect(page.getByRole("button", { name: "展开完整代码" }).first()).toBeVisible()
  })

  test("mermaid preview opens", async ({ page }) => {
    await page.getByRole("button", { name: "放大预览" }).first().click()
    await expect(page.getByRole("dialog", { name: "Mermaid 图表预览" })).toBeVisible()
    await page.getByRole("button", { name: "关闭预览" }).click()
    await expect(page.getByRole("dialog", { name: "Mermaid 图表预览" })).toBeHidden()
  })

  test("image lightbox opens", async ({ page }) => {
    await page.getByRole("button", { name: "点击放大预览图片" }).first().click()
    await expect(page.getByRole("dialog", { name: "图片预览" })).toBeVisible()
    await page.getByRole("button", { name: "关闭预览" }).click()
    await expect(page.getByRole("dialog", { name: "图片预览" })).toBeHidden()
  })

  test("table copy control exists", async ({ page }) => {
    await expect(page.getByRole("button", { name: "复制表格" }).first()).toBeVisible()
  })

  test("math copy control is revealed on hover", async ({ page }) => {
    const math = page.locator(".math-copy-container").first()
    const copy = math.locator(".math-copy-button")
    await expect(copy).toHaveCSS("opacity", "0")
    await math.hover()
    await expect(copy).toHaveCSS("opacity", "1")
  })

  test("toc highlights the current section", async ({ page }) => {
    const toc = page.getByRole("navigation", { name: "文章目录" })
    await expect(toc).toBeVisible()
    await page.getByRole("heading", { name: "7. Table" }).scrollIntoViewIfNeeded()
    await expect(toc.locator('a[href="#7-table"]')).toHaveClass(/text-primary/)
  })
})
