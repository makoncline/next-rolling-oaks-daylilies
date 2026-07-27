import { expect, test } from "@playwright/test";

const forbiddenLegacyTransforms = [
  "daylily-wordpress-dev",
  "daylilydatabase",
  "images.daylilycatalog.com",
  "/original",
  "original-",
];

const getImageSrcs = async (page: import("@playwright/test").Page) =>
  page.locator("img").evaluateAll((images) =>
    images.map((image) => {
      const element = image as HTMLImageElement;
      return element.currentSrc || element.src || "";
    })
  );

const expectSomeImageSrc = async (
  page: import("@playwright/test").Page,
  expected: string
) => {
  const imageSrcs = await getImageSrcs(page);

  expect(
    imageSrcs.some((src) => src.includes(expected)),
    `Expected one image src to include ${expected}. Saw: ${imageSrcs.join(", ")}`
  ).toBe(true);
};

const expectNoForbiddenImageSrc = async (
  page: import("@playwright/test").Page
) => {
  const imageSrcs = await getImageSrcs(page);

  for (const forbidden of forbiddenLegacyTransforms) {
    expect(
      imageSrcs.some((src) => src.includes(forbidden)),
      `Expected no image src to include ${forbidden}. Saw: ${imageSrcs.join(", ")}`
    ).toBe(false);
  }
};

test("listing detail uses generated R2 cultivar image before the v2 fallback", async ({
  page,
}) => {
  test.slow();

  await page.goto("/a-few-good-men");

  await expect(page).toHaveTitle(/A Few Good Men Daylily/);
  await expectSomeImageSrc(
    page,
    "media.daylilycatalog.com/cultivars/cr-ahs-162674"
  );
  await expectSomeImageSrc(page, "/display-800.webp");
  await expect(await page.content()).toContain("/blur-");
  await expectNoForbiddenImageSrc(page);
});

test("catalog search uses generated R2 display, thumb, and blur image variants", async ({
  page,
}) => {
  test.slow();

  await page.goto("/catalog/search?name=A%20Few%20Good%20Men");

  await expect(
    page.getByRole("heading", { level: 1, name: "Search", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A Few Good Men" }).first()
  ).toBeVisible({ timeout: 20_000 });
  await expectSomeImageSrc(
    page,
    "media.daylilycatalog.com/cultivars/cr-ahs-162674"
  );
  await expectSomeImageSrc(page, "/display-800.webp");
  await expect(await page.content()).toContain("/blur-");
  await expectNoForbiddenImageSrc(page);

  const response = await page.request.get(
    "/api/catalog/search?name=A%20Few%20Good%20Men"
  );
  expect(response.ok()).toBe(true);
  const data = await response.json();
  const listing = data.listings.find(
    (item: { title: string }) => item.title === "A Few Good Men"
  );
  const image = listing?.images?.[0];

  expect(image?.url).toContain("/display-800.webp");
  expect(image?.thumbUrl).toContain("/thumb-200.webp");
  expect(image?.blurUrl).toContain("/blur-");
  expect(JSON.stringify(image)).not.toContain("original");
});

test("listing detail prefers uploaded listing R2 image asset", async ({
  page,
}) => {
  test.slow();

  await page.goto("/16-080");

  await expect(page).toHaveTitle(/16-080 Daylily/);
  await expectSomeImageSrc(
    page,
    "media.daylilycatalog.com/users/3/listing-images/"
  );
  await expectSomeImageSrc(page, "/display-800.webp");
  await expect(await page.content()).toContain("/blur-");
  await expectNoForbiddenImageSrc(page);
});
