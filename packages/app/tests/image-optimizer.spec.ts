import { expect, test } from "@playwright/test";

test("the image optimizer serves a local homepage photo as WebP", async ({ request }) => {
  const response = await request.get(
    "/_next/image?url=%2Fassets%2Fhome-2.jpg&w=640&q=75",
    { headers: { accept: "image/webp" } },
  );
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toBe("image/webp");
  const body = await response.body();
  expect(body.subarray(0, 4).toString()).toBe("RIFF");
  expect(body.subarray(8, 12).toString()).toBe("WEBP");
});
