import { test, expect, Page } from "@playwright/test";

test("User journey through catalogs, listings, and cart", async ({ page }) => {
  // Navigate directly to the catalogs page
  await page.goto("/catalogs");

  // Verify we're on the catalogs page
  await expect(page).toHaveURL("/catalogs");
  await expect(
    page.locator('h1 span[data-testid="catalogs-title"]')
  ).toHaveText("Catalogs");

  // Click on the "View Catalog" link of the first catalog
  await page
    .locator('[data-testid="catalog-card"]')
    .first()
    .locator('[data-testid="view-catalog-link"]')
    .click();

  // Verify we're on a catalog page
  await expect(page).toHaveURL(/\/catalog\/[^/]+$/);

  // Click the next page button
  await page
    .locator('[data-testid="next-page-button-catalog"]')
    .first()
    .click();

  // Verify we're on the second page
  await expect(page.url()).toContain("page=2");

  // Wait for lily cards to be visible
  await page.waitForSelector('[data-testid="lily-card"]', {
    state: "visible",
  });

  // Get initial cart count
  const initialCartCount = await getCartCount(page);

  // Add the first item to the cart from the catalog page
  await page
    .locator('[data-testid="lily-card"]')
    .first()
    .locator('button[aria-label="add to cart"]')
    .click();

  // Check that the snackbar notification appears
  await expect(page.locator('[data-testid="snackbar-badge"]')).toBeVisible();
  await expect(page.locator('[data-testid="snackbar-badge"]')).toContainText(
    "Added"
  );

  // Check that the cart count in the navigation has updated
  await expect(page.locator('[data-testid="cart-link"]')).toContainText(
    `Cart (${initialCartCount + 1})`
  );

  // Click "View listing" on the second listing
  await page
    .locator('[data-testid="lily-card"]')
    .nth(1)
    .locator('a:has-text("View listing")')
    .click();

  // Verify we're on a listing page
  await expect(page).toHaveURL(/\/[^/]+$/);
  await expect(page.locator('[data-testid="listing-title"]')).toBeVisible();

  // Add the second item to the cart from the listing page
  await page.locator('button[aria-label="add to cart"]').click();

  // Check that the snackbar notification appears
  await expect(page.locator('[data-testid="snackbar-badge"]')).toBeVisible();
  await expect(page.locator('[data-testid="snackbar-badge"]')).toContainText(
    "Added"
  );

  // Check that the cart count in the navigation has updated
  await expect(page.locator('[data-testid="cart-link"]')).toContainText(
    `Cart (${initialCartCount + 2})`
  );

  // Navigate to the cart page
  await page.click('[data-testid="cart-link"]');

  // Verify we're on the cart page
  await expect(page).toHaveURL("/cart");

  // Check that the cart page title is visible
  await expect(page.locator('[data-testid="cart-title"]')).toHaveText("Cart");

  // Check that there are exactly two items in the cart
  const cartItems = page.locator('[data-testid="cart-item"]');
  await expect(cartItems).toHaveCount(2);

  // Verify the "Empty Cart" button is visible
  await expect(page.locator('[data-testid="empty-cart-button"]')).toBeVisible();

  // Verify the final cart count
  const finalCartCount = await getCartCount(page);
  expect(finalCartCount).toBe(initialCartCount + 2);
});

async function getCartCount(page: Page): Promise<number> {
  const cartText = await page
    .locator('[data-testid="cart-link"]')
    .textContent();
  const match = cartText?.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}
