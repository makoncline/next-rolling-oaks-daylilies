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
