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

test("list and catalog pages surface v2 hybridizer and image data", async ({
  page,
}) => {
  test.slow();

  await page.goto("/list");

  const row = page.locator("tbody tr", { hasText: "Carbon Black" }).first();
  await expect(row).toContainText("Reimer");

  await page.goto("/catalog/search?name=Carbon%20Black");

  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Carbon Black" }).first()
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('img[src*="Carbon_Black"]').first()).toBeVisible();
});
