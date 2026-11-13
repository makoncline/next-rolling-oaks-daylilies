import { test, expect } from "@playwright/test";

test("homepage has correct title and heading", async ({ page }) => {
  await page.goto("/");

  // Check the page title
  await expect(page).toHaveTitle(/Rolling Oaks Daylilies/);

  // Check the main heading
  const heading = page.locator("h1").first();
  await expect(heading).toHaveText("Rolling Oaks Daylilies");
  const logo = page.getByRole("img", { name: "Rolling Oaks Daylilies", exact: true });
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
});
