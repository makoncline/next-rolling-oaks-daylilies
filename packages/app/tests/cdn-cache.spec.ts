import { expect, test, type APIResponse } from "@playwright/test";

const cdnHeader = "cloudflare-cdn-cache-control";
const publicPolicy =
  "public, max-age=3600, stale-while-revalidate=86400, stale-if-error=86400";

const expectEdgeCached = (response: APIResponse) => {
  const headers = response.headers();
  expect(response.status(), response.url()).toBe(200);
  expect(headers[cdnHeader], response.url()).toBe(publicPolicy);
  expect(headers["cache-tag"], response.url()).toBe("rolling-oaks-site");
  expect(headers["cache-control"], response.url()).toContain("no-store");
  expect(headers["set-cookie"], response.url()).toBeUndefined();
};

const expectNotEdgeCached = (response: APIResponse) => {
  const headers = response.headers();
  expect(headers[cdnHeader] ?? "no-store", response.url()).toBe("no-store");
  expect(headers["cache-tag"], response.url()).toBeUndefined();
  expect(headers["cache-control"] ?? "", response.url()).not.toMatch(
    /public|s-maxage/
  );
};

test.describe("Cloudflare response cache headers", () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "Header checks do not depend on the browser."
  );

  test("public data responses are edge cacheable and query variants stay distinct", async ({
    request,
  }) => {
    const catalogApi = await request.get("/api/catalog/all?limit=1");
    expectEdgeCached(catalogApi);
    const { listings, pagination } = await catalogApi.json();
    const slug: string = listings[0].slug;

    const html = await request.get("/catalog/all");
    expectEdgeCached(html);
    const buildId = (await html.text()).match(/"buildId":"([^"]+)"/)?.[1];
    expect(buildId).toBeTruthy();

    for (const path of [
      "/",
      "/catalogs",
      `/${slug}`,
      `/_next/data/${buildId}/en/catalog/all.json?catalog=all`,
      `/_next/data/${buildId}/en/${slug}.json?listing=${slug}`,
      "/api/catalogs",
      `/api/listings/${slug}`,
      "/sitemap.xml",
      "/openapi.json",
      "/.well-known/api-catalog",
      "/cart",
      "/blog",
    ]) {
      expectEdgeCached(await request.get(path));
    }

    const filtered = await request.get(
      `/api/catalog/all?limit=1&name=${encodeURIComponent(listings[0].title)}`
    );
    expectEdgeCached(filtered);
    expect((await filtered.json()).pagination.total).toBeLessThan(
      pagination.total
    );
  });

  test("errors, operations and alternate representations are not edge cacheable", async ({
    request,
  }) => {
    const html = await request.get("/catalog/all");
    const buildId = (await html.text()).match(/"buildId":"([^"]+)"/)?.[1];

    const notFoundPage = await request.get("/catalog/no-such-catalog");
    expect(notFoundPage.status()).toBe(404);
    expectNotEdgeCached(notFoundPage);

    const notFoundListing = await request.get("/no-such-listing-slug");
    expect(notFoundListing.status()).toBe(404);
    expectNotEdgeCached(notFoundListing);

    const notFoundApi = await request.get("/api/listings/no-such-listing-slug");
    expect(notFoundApi.status()).toBe(404);
    expectNotEdgeCached(notFoundApi);

    expectNotEdgeCached(await request.get("/api/health"));
    expectNotEdgeCached(await request.get("/api/public-snapshot/refresh"));

    const markdown = await request.get("/catalog/all", {
      headers: { Accept: "text/markdown" },
    });
    expect(markdown.headers()["content-type"]).toContain("text/markdown");
    expectNotEdgeCached(markdown);

    const prefetch = await request.get(
      `/_next/data/${buildId}/en/catalog/all.json?catalog=all`,
      { headers: { "x-middleware-prefetch": "1", "x-nextjs-data": "1" } }
    );
    expect(await prefetch.text()).toBe("{}");
    expectNotEdgeCached(prefetch);
  });
});
