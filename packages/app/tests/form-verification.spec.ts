import { expect, test } from "@playwright/test";

test("a blocked verification script explains why the form cannot submit", async ({ page }) => {
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js*", route =>
    route.abort("failed")
  );
  await page.goto("/");
  await expect(page.getByText(
    "Could not complete verification. Check your connection and reload this page."
  )).toBeVisible();
  await expect(page.getByRole("button", {
    name: "Send Me a Message", exact: true,
  })).toBeDisabled();
});
