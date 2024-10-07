import { test, expect, Page } from "@playwright/test";

test("Add item to cart, fill out form, and submit", async ({ page }) => {
  // Navigate to the catalogs page
  await page.goto("/catalogs");

  // Click on the "View Catalog" link of the first catalog
  await page
    .locator('[data-testid="catalog-card"]')
    .first()
    .locator('[data-testid="view-catalog-link"]')
    .click();

  // Wait for lily cards to be visible
  await page.waitForSelector('[data-testid="lily-card"]', {
    state: "visible",
  });

  // Get initial cart count
  const initialCartCount = await getCartCount(page);

  // Add the first item to the cart
  await page
    .locator('[data-testid="lily-card"]')
    .first()
    .locator('button[aria-label="add to cart"]')
    .click();

  // Check that the cart count has updated
  await expect(page.locator('[data-testid="cart-link"]')).toContainText(
    `Cart (${initialCartCount + 1})`
  );

  // Navigate to the cart page
  await page.click('[data-testid="cart-link"]');

  // Verify we're on the cart page
  await expect(page).toHaveURL("/cart");

  // Fill out the cart form
  await page.fill('[data-testid="cart-name-input"]', "John Doe");
  await page.fill('[data-testid="cart-email-input"]', "john@example.com");
  await page.fill(
    '[data-testid="cart-message-input"]',
    "Please check availability for these items."
  );

  // Submit the form and wait for navigation
  await Promise.all([
    page.waitForURL("**/thanks"),
    page.click('[data-testid="cart-submit-button"]'),
  ]);

  // Check if we've navigated to the thanks page and the title element exists
  await expect(page.locator('[data-testid="thanks-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="thanks-title"]')).toHaveText(
    "Thanks for your interest!"
  );

  // Verify that the cart is empty after submission
  await page.click('[data-testid="cart-link"]');
  await expect(page).toHaveURL("/cart");
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0);
});

async function getCartCount(page: Page): Promise<number> {
  const cartText = await page
    .locator('[data-testid="cart-link"]')
    .textContent();
  const match = cartText?.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}
