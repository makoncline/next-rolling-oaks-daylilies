import { expect, test, type Page } from "@playwright/test";

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("customers can search, filter, select photos and keep cart changes after reload", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  // This journey must never send email, even if a selector changes.
  await page.route("**/api/forms", route => route.abort());
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("unset");
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  if (isMobile) {
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
  }
  await page.locator('header a[href="/catalog/search"]:visible').click();
  await expect(page).toHaveURL(/\/catalog\/search$/);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("unset");
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.locator("#search").fill("A Few Good Men");
  await expect(page.locator("main article")).toHaveCount(1);
  await expect(page.locator("main article")).toContainText("A Few Good Men");
  await page.locator("#search").fill("no-matching-cultivar-987654321");
  await expect(page.getByText("0 results", { exact: true })).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page).toHaveURL(/\/catalog\/search$/);
  await expect(page.locator("main article").first()).toBeVisible();
  await page.getByRole("switch", { name: "Advanced" }).click();
  await page.getByRole("button", { name: "Plant", exact: true }).click();
  await page.locator("#ploidy").selectOption("Tetraploid");
  await expect(page).toHaveURL(/ploidy=Tetraploid/);
  await page.locator("#rebloom").check();
  await expect(page).toHaveURL(/rebloom=true/);
  await expect(page.locator("#ploidy")).toHaveValue("Tetraploid");
  await expect(page.locator("main article").first()).toBeVisible();
  await expectNoOverflow(page);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page.locator("#rebloom")).not.toBeChecked();
  await expect(page.locator("#ploidy")).toHaveValue("");

  await page.goto("/3081");
  const photo = page.getByRole("img", { name: "19-4 Photo", exact: true });
  const first = await photo.getAttribute("src");
  await page.getByRole("button", { name: "Show 19-4 Photo 2", exact: true }).click();
  await expect(photo).not.toHaveAttribute("src", first!);
  await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.getByRole("button", { name: "Show 19-4 Photo 1", exact: true }).click();
  await expect(photo).toHaveAttribute("src", first!);
  await expectNoOverflow(page);

  await page.goto("/3546");
  await page.getByRole("button", { name: "Add NTS1 to Cart", exact: true }).click();
  await page.goto("/cart");
  await page.getByRole("button", { name: "Add One NTS1", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove One NTS1", exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("cartItems")!)["3546"].quantity)).toBe(2);
  await expectNoOverflow(page);
  await page.getByRole("button", { name: "Remove One NTS1", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cartItems")!)["3546"].quantity)).toBe(1);
  await page.getByRole("button", { name: "Empty Cart", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove One NTS1", exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});
