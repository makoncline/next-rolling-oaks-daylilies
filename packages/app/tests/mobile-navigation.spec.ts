import { expect, test } from "@playwright/test";

test("mobile navigation covers a changing viewport and preserves page position", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  const scrollY = await page.evaluate(() => window.scrollY);
  const trigger = page.getByRole("button", { name: "Toggle navigation", exact: true });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Navigation", exact: true });
  await expect(menu).toBeVisible();
  for (const height of [700, 920, 540]) {
    await page.setViewportSize({ width: 390, height });
    await expect(menu).toBeVisible();
    await expect.poll(async () => {
      const bounds = await menu.boundingBox();
      return bounds ? Math.abs(bounds.y) + Math.abs(bounds.height - height) : Infinity;
    }).toBeLessThan(2);
    expect(await menu.evaluate((element) => {
      const bottom = document.elementFromPoint(innerWidth / 2, innerHeight - 2);
      return bottom !== null && element.contains(bottom);
    })).toBe(true);
  }
  await page.keyboard.press("PageDown");
  if (browserName !== "webkit") {
    await page.mouse.move(190, 450);
    await page.mouse.wheel(0, 400);
  }
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  await page.getByRole("button", { name: "Close navigation", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  await trigger.click();
  await menu.getByRole("link", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/catalog\/search$/);
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole("searchbox", { name: "Search by name" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
});

test("mobile navigation contains keyboard focus and closes on Escape or desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Toggle navigation", exact: true });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Navigation", exact: true });
  await expect(page.getByRole("button", { name: "Close navigation", exact: true })).toBeFocused();
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(menu).toHaveCount(0);
  await expect(page.locator('header a[href="/catalog/search"]:visible')).toBeVisible();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
});
