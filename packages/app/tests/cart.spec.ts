import { expect, test } from "@playwright/test";

test("customers can remove cart items and empty the cart", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "cartProducts",
      JSON.stringify({
        "test-daylily": {
          id: "test-daylily",
          name: "Test Daylily",
          price: 20,
        },
        "other-daylily": {
          id: "other-daylily",
          name: "Other Daylily",
          price: 15,
        },
      })
    );
    window.localStorage.setItem(
      "cartItems",
      JSON.stringify({
        "test-daylily": { productId: "test-daylily", quantity: 2 },
        "other-daylily": { productId: "other-daylily", quantity: 1 },
      })
    );
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cart");

  const testDaylily = page
    .getByRole("article")
    .filter({ hasText: "Test Daylily" });

  await expect(testDaylily).toContainText("Quantity: 2");
  await testDaylily
    .getByRole("button", { name: "Remove One Test Daylily" })
    .click();
  await expect(testDaylily).toContainText("Quantity: 1");

  await testDaylily
    .getByRole("button", { name: "Remove One Test Daylily" })
    .click();
  await expect(testDaylily).toHaveCount(0);

  await page.getByRole("button", { name: "Empty Cart" }).click();
  await expect(page.getByRole("button", { name: "Empty Cart" })).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("cart rows can be removed and the minimum order is explained", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "cartProducts",
      JSON.stringify({
        "small-daylily": { id: "small-daylily", name: "Small Daylily", price: 8 },
        "other-daylily": { id: "other-daylily", name: "Other Daylily", price: 15 },
      })
    );
    window.localStorage.setItem(
      "cartItems",
      JSON.stringify({
        "small-daylily": { productId: "small-daylily", quantity: 1 },
        "other-daylily": { productId: "other-daylily", quantity: 1 },
      })
    );
  });
  await page.goto("/cart");

  const minimumNote = page.getByText(/^Orders have a \$20\.00 minimum/);
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(minimumNote).toHaveCount(0);

  await page.getByRole("button", { name: "Remove Other Daylily from cart" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(minimumNote).toContainText("$12.00 short");
  expect(
    await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("cartItems")!)))
  ).toEqual(["small-daylily"]);

  await page.getByRole("button", { name: "Add One Small Daylily" }).click();
  await page.getByRole("button", { name: "Add One Small Daylily" }).click();
  await expect(page.getByRole("article")).toContainText("Quantity: 3");
  await expect(minimumNote).toHaveCount(0);
});
