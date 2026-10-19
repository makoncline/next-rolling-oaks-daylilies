import { expect, test } from "@playwright/test";

// Replace only the external widget. Exercise the real form and token encoding.
const turnstileScript = `
  const callback = new URL(document.currentScript.src).searchParams.get("onload");
  if (callback && typeof window[callback] !== "function") {
    throw new Error("Turnstile load callback is missing");
  }
  const widgets = new Map();
  let tokenNumber = 0;
  window.turnstile = {
    render(container, options) {
      const id = crypto.randomUUID();
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "cf-turnstile-response";
      const solve = document.createElement("button");
      solve.type = "button";
      solve.textContent = "Complete test verification";
      solve.onclick = () => {
        input.value = options.action + "-token-" + (++tokenNumber);
        options.callback(input.value);
      };
      const expire = document.createElement("button");
      expire.type = "button";
      expire.textContent = "Expire test verification";
      expire.onclick = () => {
        input.value = "";
        options["expired-callback"]();
      };
      container.append(input, solve, expire);
      widgets.set(id, { container, input });
      return id;
    },
    reset(id) { widgets.get(id).input.value = ""; },
    remove(id) { widgets.get(id)?.container.replaceChildren(); widgets.delete(id); },
    getResponse(id) { return widgets.get(id).input.value; },
    isExpired(id) { return !widgets.get(id).input.value; }
  };
  if (callback) window[callback]();
`;

test.beforeEach(async ({ page }) => {
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js*", route =>
    route.fulfill({ contentType: "application/javascript", body: turnstileScript })
  );
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
  await expect(page.getByRole("button", { name: "Check Availability", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Complete test verification" }).click();
});

test("a cart open for three hours submits without a timestamp and clears on success", async ({ page }) => {
  const loadedAt = Date.now();
  await page.clock.setFixedTime(loadedAt);
  await page.clock.setFixedTime(loadedAt + 3 * 60 * 60 * 1000);
  await page.route("**/api/forms", async (route) => {
    const body = new URLSearchParams(route.request().postData() || "");
    expect(body.has("form-started-at")).toBe(false);
    expect(body.get("cf-turnstile-response")).toMatch(/^cart-token-/);
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
    let firstToken = "";
    const before = await page.evaluate(() => ({
      items: localStorage.getItem("cartItems"),
      products: localStorage.getItem("cartProducts"),
    }));
    await page.route("**/api/forms", async (route) => {
      firstToken = new URLSearchParams(route.request().postData() || "").get("cf-turnstile-response") || "";
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
    await expect(submit).toBeDisabled();
    expect(await page.evaluate(() => ({
      items: localStorage.getItem("cartItems"),
      products: localStorage.getItem("cartProducts"),
    }))).toEqual(before);
    await page.unroute("**/api/forms");
    await page.route("**/api/forms", (route) => {
      const token = new URLSearchParams(route.request().postData() || "").get("cf-turnstile-response");
      expect(token).toMatch(/^cart-token-/);
      expect(token).not.toBe(firstToken);
      return route.fulfill({ json: { ok: true } });
    });
    await page.getByRole("button", { name: "Complete test verification" }).click();
    await submit.click();
    await expect(page).toHaveURL(/\/thanks$/);
  });
}

test("an expired check disables submission until verification succeeds again", async ({ page }) => {
  const submit = page.getByRole("button", { name: "Check Availability", exact: true });
  await expect(submit).toBeEnabled();
  await page.getByRole("button", { name: "Expire test verification" }).click();
  await expect(submit).toBeDisabled();
  await page.getByRole("button", { name: "Complete test verification" }).click();
  await expect(submit).toBeEnabled();
});

test("the contact form includes its verification token", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("#contact-form");
  await form.getByRole("textbox", { name: "Your name", exact: true }).fill("Test Customer");
  await form.getByRole("textbox", { name: "Your email", exact: true }).fill("customer@example.test");
  await form.getByRole("textbox", { name: "Your message", exact: true }).fill("Is this daylily available?");
  const submit = form.getByRole("button", { name: "Send Me a Message", exact: true });
  await expect(submit).toBeDisabled();
  await form.getByRole("button", { name: "Complete test verification" }).click();
  await page.route("**/api/forms", route => {
    const body = new URLSearchParams(route.request().postData() || "");
    expect(body.get("form-name")).toBe("contact");
    expect(body.get("cf-turnstile-response")).toMatch(/^contact-token-/);
    expect(body.get("message")).toBe("Is this daylily available?");
    return route.fulfill({ json: { ok: true } });
  });
  await submit.click();
  await expect(page).toHaveURL(/\/thanks$/);
});
