import { expect, test, type Page } from "@playwright/test";

async function openAdvanced(page: Page) {
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  const advanced = page.getByRole("switch", { name: "Advanced", exact: true });
  if (await advanced.getAttribute("aria-checked") === "false") await advanced.click();
}

const count = async (page: Page) => Number(
  (await page.locator("main p").filter({ hasText: /^[\d,]+ results?$/ }).innerText()).replace(/\D/g, "")
);

test("Form offers separate traits, combines choices, and retains them on reload", async ({ page }) => {
  await page.goto("/catalog/search");
  await openAdvanced(page);
  await page.getByRole("button", { name: "Classification & Details", exact: true }).click();
  await page.getByRole("button", { name: "Form", exact: true }).click();
  const choices = page.getByRole("dialog", { name: "Form", exact: true });
  await expect(choices.getByRole("checkbox", { name: "Unusual", exact: true })).toBeVisible();
  await expect(choices).not.toContainText("|");
  const total = await count(page);
  await choices.getByRole("checkbox", { name: "Double", exact: true }).check();
  await expect(page).toHaveURL(/form=Double/);
  await expect(page.locator('[data-ui="spinner"]')).toHaveCount(0);
  await expect.poll(() => count(page)).toBeLessThan(total);
  const doubles = await count(page);
  await choices.getByRole("checkbox", { name: "Spider", exact: true }).check();
  await expect(page).toHaveURL(/form=Double%7CSpider/);
  await expect.poll(() => count(page)).toBeGreaterThan(doubles);
  await page.keyboard.press("Escape");
  await page.reload();
  await openAdvanced(page);
  await page.getByRole("button", { name: "Form", exact: true }).click();
  await expect(choices.getByRole("checkbox", { name: "Double", exact: true })).toBeChecked();
  await expect(choices.getByRole("checkbox", { name: "Spider", exact: true })).toBeChecked();
  await choices.getByRole("searchbox").fill("unusual");
  await expect(choices.getByRole("checkbox")).toHaveCount(1);
  await choices.getByRole("button", { name: "Clear form", exact: true }).click();
  await expect(page).not.toHaveURL(/form=/);
});

test("numeric fields retain exact ranges and return plants within both bounds", async ({ page, request }) => {
  test.setTimeout(90_000);
  const fields = [
    ["price", "Price", "Listing", "10.5", "25"],
    ["year", "Year", "Registration", "2000", "2010"],
    ["bloomSize", "Bloom size", "Bloom Traits", "4.5", "5.5"],
    ["scapeHeight", "Scape height", "Bloom Traits", "24.5", "36"],
    ["budcount", "Bud count", "Bloom Traits", "15", "30"],
    ["branches", "Branches", "Bloom Traits", "3", "5"],
  ];
  for (const [key, label, section, min, max] of fields) {
    await page.goto("/catalog/search");
    await openAdvanced(page);
    if (section !== "Listing") await page.getByRole("button", { name: section, exact: true }).click();
    const low = page.getByRole("spinbutton", { name: `${label} minimum`, exact: true });
    const high = page.getByRole("spinbutton", { name: `${label} maximum`, exact: true });
    await low.fill(min);
    await high.click();
    await expect.poll(() => new URL(page.url()).searchParams.get(key)).toBe(`${min}:`);
    await high.fill(max);
    await high.press("Enter");
    await expect.poll(() => new URL(page.url()).searchParams.get(key)).toBe(`${min}:${max}`);
    await expect(page.locator("main article").first()).toBeVisible();
    const response = await request.get(`/api/catalog/search?${key}=${min}:${max}&limit=100`);
    expect(response.ok()).toBe(true);
    const { listings } = await response.json();
    expect(listings.length).toBeGreaterThan(0);
    for (const listing of listings) {
      const value = key === "price" ? listing.price : parseFloat(listing.ahsListing[key]);
      expect(value).toBeGreaterThanOrEqual(Number(min));
      expect(value).toBeLessThanOrEqual(Number(max));
    }
    await page.reload();
    await openAdvanced(page);
    await expect(low).toHaveValue(min);
    await expect(high).toHaveValue(max);
    await low.fill(String(Number(max) + 1));
    await low.press("Enter");
    await expect(page.locator(`#${key}-error`)).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get(key)).toBe(`${min}:${max}`);
    await page.getByRole("button", { name: `Clear ${label.toLowerCase()}`, exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.has(key)).toBe(false);
  }
});

test("range sliders commit on keyboard input and an upper-only bound is clear", async ({ page }) => {
  await page.goto("/catalog/search");
  await openAdvanced(page);
  const max = page.getByRole("spinbutton", { name: "Price maximum", exact: true });
  await max.fill("25");
  await max.press("Enter");
  await expect(page.getByRole("button", { name: "Remove filter Price: up to $25", exact: true })).toBeVisible();
  const slider = page.getByRole("slider", { name: "Price maximum", exact: true });
  await slider.focus();
  await slider.press("ArrowLeft");
  await expect(max).toHaveValue("24.99");
  await expect.poll(() => new URL(page.url()).searchParams.get("price")?.split(":")[1]).toBe("24.99");
});

test("Lists works in basic mode and Parentage persists in advanced mode", async ({ page }) => {
  await page.goto("/catalog/search");
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Advanced" })).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "Lists", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Lists", exact: true });
  await dialog.getByRole("searchbox").fill("Kay Cline");
  await dialog.getByRole("checkbox", { name: "Kay Cline's Introductions", exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(page.locator("main article").first()).toBeVisible();
  await expect(page).toHaveURL(/list=/);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page.getByRole("switch", { name: "Advanced" }).click();
  await page.getByRole("button", { name: "Classification & Details", exact: true }).click();
  await page.getByRole("textbox", { name: "Parentage", exact: true }).fill("Highland Lord");
  await expect(page).toHaveURL(/parentage=Highland/);
  await expect(page.locator("main article").first()).toBeVisible();
  await page.reload();
  await openAdvanced(page);
  await expect(page.getByRole("textbox", { name: "Parentage", exact: true })).toHaveValue("Highland Lord");
});
