import { expect, test, type Page } from "@playwright/test";

const resultsLine = (page: Page) =>
  page.locator("main p").filter({ hasText: /^[\d,]+ results?$/ });

async function resultCount(page: Page) {
  const text = (await resultsLine(page).textContent()) ?? "";
  return Number(text.replace(/[^\d]/g, ""));
}

async function openFilters(page: Page) {
  await page
    .getByRole("button", { name: "Filters", exact: true })
    .click();
  await expect(page.locator("[data-ui=filter-panel]")).toBeVisible();
}

const advancedSwitch = (page: Page) =>
  page.getByRole("switch", { name: "Advanced" });

test.beforeEach(async ({ page }) => {
  // Searching must never send email, even if a selector changes.
  await page.route("**/api/forms", (route) => route.abort());
});

test("basic search shows name search and quick filters only", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/catalog/search");
  await openFilters(page);

  await expect(advancedSwitch(page)).toHaveAttribute("aria-checked", "false");
  await expect(page.locator("#search")).toBeVisible();
  await expect(page.locator("#forSale")).toBeVisible();
  await expect(page.locator("#photo")).toBeVisible();
  await expect(page.getByRole("button", { name: "Lists", exact: true })).toBeVisible();
  await expect(page.locator("#rebloom")).toBeVisible();
  await expect(page.locator("#ploidy")).toHaveCount(0);
  await expect(page.locator("#hybridizer")).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Active filters" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("advanced search reveals grouped sections with active counts", async ({ page }) => {
  await page.goto("/catalog/search");
  await openFilters(page);
  const total = await resultCount(page);

  await advancedSwitch(page).click();
  await expect(advancedSwitch(page)).toHaveAttribute("aria-checked", "true");
  for (const name of ["Listing", "Registration", "Bloom Traits", "Classification & Details"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  // The first section starts open; the rest stay collapsed until chosen.
  await expect(page.locator("#letters")).toBeVisible();
  await expect(page.locator("#ploidy")).toBeHidden();

  const plant = page.getByRole("button", { name: "Classification & Details", exact: true });
  await plant.click();
  await expect(plant).toHaveAttribute("aria-expanded", "true");
  await page.locator("#ploidy").click();
  await page.getByRole("checkbox", { name: "Tetraploid", exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/ploidy=Tetraploid/);
  await expect.poll(() => resultCount(page)).toBeLessThan(total);
  await expect(plant).toHaveAccessibleDescription("1 active filter");
  await expect(
    page.getByRole("button", { name: "Remove filter Ploidy: Tetraploid" })
  ).toBeVisible();

  await plant.click();
  await expect(plant).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#ploidy")).toBeHidden();
});

test("for-sale quick filter narrows to priced plants and chips remove it", async ({ page }) => {
  await page.goto("/catalog/search");
  await openFilters(page);
  const total = await resultCount(page);

  await page.locator("#forSale").check();
  await expect(page).toHaveURL(/forSale=true/);
  await expect.poll(() => resultCount(page)).toBeLessThan(total);
  const cards = page.locator("main article");
  await expect(cards.first()).toBeVisible();
  await expect(cards.filter({ hasText: "Display Only" })).toHaveCount(0);

  const chip = page.getByRole("button", { name: "Remove filter For sale" });
  await chip.click();
  await expect(page).not.toHaveURL(/forSale=/);
  await expect(page.locator("#forSale")).not.toBeChecked();
  await expect.poll(() => resultCount(page)).toBe(total);
  await expect(page.getByRole("list", { name: "Active filters" })).toHaveCount(0);
});

test("has-photo filter and name search combine, and Clear all resets", async ({ page }) => {
  await page.goto("/catalog/search");
  await openFilters(page);
  const total = await resultCount(page);

  await page.locator("#photo").check();
  await expect(page).toHaveURL(/photo=true/);
  await expect.poll(() => resultCount(page)).toBeLessThan(total);

  await page.locator("#search").fill("Joy");
  await expect(page).toHaveURL(/name=Joy/);
  await expect(page.locator("main article").first()).toContainText(/joy/i);
  await expect(
    page.getByRole("button", { name: 'Remove filter Name: Joy' })
  ).toBeVisible();

  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page).toHaveURL(/\/catalog\/search$/);
  await expect(page.locator("#photo")).not.toBeChecked();
  await expect(page.locator("#search")).toHaveValue("");
  await expect.poll(() => resultCount(page)).toBe(total);
});

test("shared links with advanced filters open advanced mode and the section", async ({ page }) => {
  await page.goto("/catalog/search?ploidy=Tetraploid&rebloom=true");
  await openFilters(page);

  await expect(advancedSwitch(page)).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#ploidy")).toBeVisible();
  await page.locator("#ploidy").click();
  await expect(page.getByRole("checkbox", { name: "Tetraploid", exact: true })).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(page.locator("#rebloom")).toBeChecked();

  // Switching back to basic hides the fields but keeps the filters applied.
  const filtered = await resultCount(page);
  await advancedSwitch(page).click();
  await expect(page.locator("#ploidy")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Remove filter Ploidy: Tetraploid" })
  ).toBeVisible();
  expect(await resultCount(page)).toBe(filtered);
  await expect(page).toHaveURL(/ploidy=Tetraploid/);
});

test("quick filters that cannot narrow a catalog are not offered", async ({ page }) => {
  await page.goto("/catalog/for-sale");
  await openFilters(page);
  await expect(page.locator("#forSale")).toHaveCount(0);
  await expect(page.locator("#rebloom")).toBeVisible();
});

test("the advanced switch and sections work from the keyboard", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard navigation is a desktop interaction");
  await page.goto("/catalog/search");
  await openFilters(page);

  await advancedSwitch(page).focus();
  await page.keyboard.press("Space");
  await expect(advancedSwitch(page)).toHaveAttribute("aria-checked", "true");

  const bloom = page.getByRole("button", { name: "Bloom Traits", exact: true });
  await bloom.focus();
  await page.keyboard.press("Enter");
  await expect(bloom).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#bloomSeason")).toBeVisible();
});

test("advanced filters fit narrow screens without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/catalog/search?hybridizer=Tim%20Bell");
  await openFilters(page);
  await expect(page.locator("#hybridizer")).toBeVisible();
  for (const name of ["Listing", "Bloom Traits", "Classification & Details"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
});


test("typing then toggling keeps both filters, and long chips fit", async ({ page }) => {
  await page.goto("/catalog/search");
  await openFilters(page);
  await page.locator("#search").fill("Joy");
  await page.locator("#forSale").check();
  await expect(page).toHaveURL(/name=Joy/);
  await expect(page).toHaveURL(/forSale=true/);
  await expect(page.locator("#search")).toHaveValue("Joy");
  await expect(page.locator("main article").first()).toContainText(/joy/i);
  await expect(page.locator("main article").filter({ hasText: "Display Only" })).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 800 });
  const longName = "A".repeat(180);
  await page.locator("#search").fill(longName);
  await expect(page.getByRole("button", { name: `Remove filter Name: ${longName}` })).toBeVisible();
  await expect(page.getByText("0 results", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page).toHaveURL(/\/catalog\/search$/);
  await page.reload();
  await expect(page.locator("main article").first()).toBeVisible();
});

test("failed searches show an error and can retry the selected filters", async ({ page }) => {
  await page.goto("/catalog/search");
  await openFilters(page);
  await page.route("**/api/catalog/search?*", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: '{}' })
  );
  await page.locator("#search").fill("Joy");
  await expect(page.locator("main").getByRole("alert")).toContainText("Search results could not load");
  await expect(page.locator("main article")).toHaveCount(0);
  await page.unroute("**/api/catalog/search?*");
  await page.getByRole("button", { name: "Retry search", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await expect(page.locator("main article").first()).toContainText(/joy/i);
  await expect(page.locator("#search")).toHaveValue("Joy");
});

test("catalog API includes price boundaries and matches selected foliage exactly", async ({ request }) => {
  for (const [price, minimum, maximum] of [["10:19.99", 10, 19.99], ["50:", 50, Infinity]] as const) {
    const response = await request.get(`/api/catalog/search?price=${price}&limit=100`);
    expect(response.ok()).toBe(true);
    const { listings } = await response.json();
    expect(listings.length).toBeGreaterThan(0);
    expect(listings.some((listing: { price: number }) => listing.price === minimum)).toBe(true);
    for (const listing of listings) {
      expect(listing.price).toBeGreaterThanOrEqual(minimum);
      expect(listing.price).toBeLessThanOrEqual(maximum);
    }
  }
  const response = await request.get("/api/catalog/search?foliageType=Evergreen&limit=100");
  expect(response.ok()).toBe(true);
  const { listings } = await response.json();
  expect(listings.length).toBeGreaterThan(0);
  for (const listing of listings) expect(listing.ahsListing.foliageType).toBe("Evergreen");
});


test("catalog navigation clears filters and closes the mobile menu", async ({ page, isMobile }) => {
  await page.goto("/catalog/for-sale?ploidy=Tetraploid");
  await openFilters(page);
  await expect(advancedSwitch(page)).toHaveAttribute("aria-checked", "true");
  if (isMobile) await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.locator('header a[href="/catalog/search"]:visible').click();
  await expect(page).toHaveURL(/\/catalog\/search$/);
  if (isMobile) {
    await expect(page.getByRole("button", { name: "Toggle navigation" })).toHaveAttribute("aria-expanded", "false");
  }
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("unset");
  await expect(page.getByRole("list", { name: "Active filters" })).toHaveCount(0);
  await expect(advancedSwitch(page)).toHaveAttribute("aria-checked", "false");
  await expect(page.locator("main article").first()).toBeVisible();
});

test("name search is visible in the catalog toolbar without opening filters", async ({ page }) => {
  await page.goto("/catalog/search");
  await expect(page.locator("[data-ui=filter-panel]")).toHaveCount(0);
  const search = page.getByRole("searchbox", { name: "Search by name" });
  await expect(search).toBeVisible();
  await search.fill("A Few Good Men");
  await expect(page).toHaveURL(/name=A(\+|%20)Few(\+|%20)Good(\+|%20)Men/);
  await expect(page.locator("main article")).toHaveCount(1);
  await expect(page.getByRole("status").filter({ hasText: /^1 result$/ })).toBeVisible();
  await expect(page.locator('[data-ui="notifications"]')).toBeEmpty();

  await search.fill("Coff");
  await expect(page).toHaveURL(/name=Coff/);
  await expect(page.locator("main article").first()).toContainText(/Coff/i);
  await expect(page.locator('[data-ui="notifications"]')).toBeEmpty();
});

test("Back after paging returns to the previous catalog page", async ({ page }) => {
  await page.goto("/");
  await page.goto("/catalog/for-sale");
  const next = page.getByRole("link", { name: "Top Catalog Pagination Next Page" });
  const firstTile = page.locator("main article h2").first();
  const pageOneFirst = await firstTile.textContent();

  await next.click();
  await expect(page).toHaveURL(/page=2/);
  await expect(firstTile).not.toHaveText(pageOneFirst!);
  const pageTwoFirst = await firstTile.textContent();
  await next.click();
  await expect(page).toHaveURL(/page=3/);

  await page.goBack();
  await expect(page).toHaveURL(/page=2/);
  await expect(firstTile).toHaveText(pageTwoFirst!);
  await page.goBack();
  await expect(page).toHaveURL(/\/catalog\/for-sale$/);
  await expect(firstTile).toHaveText(pageOneFirst!);
});
