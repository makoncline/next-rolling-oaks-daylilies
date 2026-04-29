import { expect, test } from "@playwright/test";

test("listing detail uses cultivar reference display data for a v2-only listing", async ({
  page,
}) => {
  test.slow();

  await page.goto("/carbon-black");

  await expect(page).toHaveTitle(/Carbon Black Daylily/);
  await expect(page.getByText("Reimer")).toBeVisible();
  await expect(page.locator('img[src*="Carbon_Black"]').first()).toBeVisible();
});

test("catalog search surfaces v2 hybridizer and image data", async ({ page }) => {
  test.slow();

  await page.goto("/catalog/search?name=Carbon%20Black");

  await expect(
    page.getByRole("heading", { level: 1, name: "Search", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Carbon Black" }).first()
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('img[src*="Carbon_Black"]').first()).toBeVisible();
  await expect(page.getByText("Reimer")).toBeVisible();
});
