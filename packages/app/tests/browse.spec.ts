import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Browsing must never send email, even if a selector changes.
  await page.route("**/api/forms", (route) => route.abort());
});

const tilePrices = async (page: Page) =>
  (await page.locator("main article").allTextContents())
    .map((text) => text.match(/\$([\d,]+\.\d\d)/)?.[1])
    .filter(Boolean)
    .map((price) => Number(price!.replace(/,/g, "")));

test("catalog results can be sorted and the order survives reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/catalog/for-sale");
  const sort = page.getByRole("combobox", { name: "Sort by" });
  await expect(sort).toHaveValue("");

  await sort.selectOption("price-desc");
  await expect(page).toHaveURL(/sort=price-desc/);
  await expect.poll(async () => {
    const prices = await tilePrices(page);
    return prices.length > 1 && prices.every((price, i) => i === 0 || prices[i - 1] >= price);
  }).toBe(true);

  await page.reload();
  await expect(sort).toHaveValue("price-desc");
  const high = await tilePrices(page);
  await sort.selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  await expect.poll(async () => (await tilePrices(page))[0]).toBeLessThan(high[0]);

  await page.getByRole("searchbox", { name: "Search by name" }).fill("Spacecoast");
  await expect(page).toHaveURL(/name=Spacecoast/);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page).not.toHaveURL(/name=/);
  await expect(page).toHaveURL(/sort=price-asc/);
  expect(errors).toEqual([]);
});

test("listing parents in the catalog are links, and related plants are shown", async ({ page }) => {
  await page.goto("/after-the-fire");
  const related = page.getByRole("region", { name: "More by Petit" });
  await expect(related.locator("article")).toHaveCount(4);
  await expect(related.getByRole("link", { name: "See all 35" })).toHaveAttribute(
    "href",
    "/catalog/search?hybridizer=Petit"
  );

  await page.getByRole("link", { name: "Highland Lord", exact: true }).click();
  await expect(page).toHaveURL(/\/highland-lord$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Highland Lord");

  await page.goto("/catalog/search?hybridizer=Petit");
  await expect(page.locator("main p").filter({ hasText: /^35 results$/ })).toBeVisible();
});

test("listings without photos show a no-photo tile", async ({ page }) => {
  await page.goto("/timeless-romance");
  await expect(page.getByRole("img", { name: "No photo of Timeless Romance yet" })).toBeVisible();
});

test("homepage features Kay Cline's introductions", async ({ page }) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "Kay Cline’s Introductions" });
  await expect(section.locator("article")).toHaveCount(6);
  await expect(section.getByRole("link", { name: "See all 26" })).toHaveAttribute(
    "href",
    "/catalog/kay-cline's-introductions"
  );
  await expect(page.getByRole("link", { name: "Shop Daylilies for Sale" })).toHaveAttribute(
    "href",
    "/catalog/for-sale"
  );
});

test("listing Add sits beside the price; phones get a bar only after scrolling past it", async ({ page, isMobile }) => {
  await page.goto("/3546");
  const add = page.getByRole("button", { name: "Add NTS1 to Cart", exact: true });
  await expect(add).toHaveCount(1);
  const box = await add.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(page.viewportSize()!.height);

  await add.click();
  await expect(page.getByRole("status").filter({ hasText: "Added NTS1 to Cart" })).toBeAttached();
  await expect(page.getByText("In cart: 1").first()).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  if (isMobile) {
    await expect(add).toHaveCount(2);
    await add.last().click();
  } else {
    await expect(add).toHaveCount(1);
    await add.click();
  }
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cartItems")!)["3546"].quantity))
    .toBe(2);
});

test("mobile Add bar follows navigation through display-only listings", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The scrolling Add bar is only shown on phones");
  await page.goto("/double-blue-blood");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Double Blue Blood");

  for (let visit = 0; visit < 2; visit += 1) {
    await page.getByRole("link", { name: "Highland Lord", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Highland Lord");
    const add = page.getByRole("button", { name: "Add Highland Lord to Cart", exact: true });
    await expect(add).toHaveCount(1);
    await expect(add).toBeInViewport();

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(add).toHaveCount(2);
    await expect(add.last()).toBeInViewport();
    await add.last().click();
    await expect(page.getByText(`In cart: ${visit + 1}`, { exact: true }).last()).toBeVisible();

    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Double Blue Blood");
    await expect(add).toHaveCount(0);
  }
});

test("tiles keep showing what is in the cart, and the cart shows plant photos", async ({ page }) => {
  await page.goto("/catalog/search?name=NTS1");
  const tile = page.locator("main article").filter({ hasText: "NTS1" }).first();
  const add = tile.getByRole("button", { name: "Add NTS1 to Cart", exact: true });
  await add.click();
  await expect(tile.getByText("In cart: 1")).toBeVisible();
  await add.click();
  await expect(tile.getByText("In cart: 2")).toBeVisible();

  await page.goto("/cart");
  const row = page.locator("main article").filter({ hasText: "NTS1" });
  await expect(row.locator("img")).toHaveAttribute("src", /media\.daylilycatalog\.com/);
});

test("top pagination is Previous and Next only; the page jump stays at the bottom", async ({ page }) => {
  await page.goto("/catalog/for-sale");
  const top = page.getByRole("navigation", { name: "Top Catalog Pagination" });
  await expect(top.getByText(/^Page 1 of \d+$/)).toBeVisible();
  await expect(page.getByLabel("Top Catalog Pagination Page Number")).toHaveCount(0);
  await expect(page.getByLabel("Bottom Catalog Pagination Page Number")).toHaveCount(1);
});
