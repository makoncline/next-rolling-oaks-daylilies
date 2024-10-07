import { test, expect } from "@playwright/test";

test.describe("Home Page Contact Form", () => {
  test("should submit the form and navigate to the thanks page", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Fill out the contact form
    await page.fill('[data-testid="contact-name"]', "John Doe");
    await page.fill('[data-testid="contact-email"]', "john.doe@example.com");
    await page.fill(
      '[data-testid="contact-message"]',
      "This is a test message"
    );

    // Submit the form and wait for navigation
    await Promise.all([
      page.waitForURL("**/thanks"),
      page.click('[data-testid="contact-submit"]'),
    ]);

    // Check if we've navigated to the thanks page and the title element exists
    await expect(page.locator('[data-testid="thanks-title"]')).toBeVisible();
  });
});
