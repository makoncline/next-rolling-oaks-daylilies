import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/cart");
  await page.evaluate(() => {
    localStorage.setItem(
      "cartProducts",
      JSON.stringify({
        "test-daylily": { id: "test-daylily", name: "Test Daylily", price: 20 },
      })
    );
    localStorage.setItem(
      "cartItems",
      JSON.stringify({
        "test-daylily": { productId: "test-daylily", quantity: 2 },
      })
    );
  });
  await page.reload();
  await page
    .getByRole("textbox", { name: "Your name", exact: true })
    .fill("Test Customer");
  await page
    .getByRole("textbox", { name: "Your email", exact: true })
    .fill("customer@example.test");
});

test("a cart open for three hours submits without a timestamp and clears on success", async ({ page }) => {
  const loadedAt = Date.now();
  await page.clock.setFixedTime(loadedAt);
  await page.clock.setFixedTime(loadedAt + 3 * 60 * 60 * 1000);
  await page.route("**/api/forms", async (route) => {
    const body = new URLSearchParams(route.request().postData() || "");
    expect(body.has("form-started-at")).toBe(false);
    expect(body.get("cartText")).toContain("(2) x Test Daylily");
    await route.fulfill({ json: { ok: true } });
  });
  await page
    .getByRole("button", { name: "Check Availability", exact: true })
    .click();
  await expect(page).toHaveURL(/\/thanks$/);
  expect(await page.evaluate(() => ({
    items: localStorage.getItem("cartItems"),
    products: localStorage.getItem("cartProducts"),
  }))).toEqual({ items: "{}", products: "{}" });
});

for (const failure of ["API", "network"]) {
  test(`${failure} failure keeps the cart and permits a retry`, async ({ page }) => {
    const before = await page.evaluate(() => ({
      items: localStorage.getItem("cartItems"),
      products: localStorage.getItem("cartProducts"),
    }));
    await page.route("**/api/forms", async (route) => {
      if (failure === "network") {
        await route.abort("failed");
      } else {
        await route.fulfill({
          status: 500,
          json: { error: "Could not send message" },
        });
      }
    });
    const submit = page.getByRole("button", {
      name: "Check Availability",
      exact: true,
    });
    await submit.click();
    await expect(page.getByText(
      "Could not submit your availability request. Please try again."
    )).toBeVisible();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(submit).toBeEnabled();
    expect(await page.evaluate(() => ({
      items: localStorage.getItem("cartItems"),
      products: localStorage.getItem("cartProducts"),
    }))).toEqual(before);
    await page.unroute("**/api/forms");
    await page.route("**/api/forms", (route) =>
      route.fulfill({ json: { ok: true } })
    );
    await submit.click();
    await expect(page).toHaveURL(/\/thanks$/);
  });
}
