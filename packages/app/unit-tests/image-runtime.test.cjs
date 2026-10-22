const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const path = require("node:path");
const test = require("node:test");

const appRequire = createRequire(path.join(__dirname, "../package.json"));

test("Next image runtime converts a raster image to WebP", async () => {
  const { getSharp } = appRequire("next/dist/server/image-optimizer/transform");
  const sharp = getSharp();
  const original = await sharp({
    create: { width: 8, height: 8, channels: 3, background: "green" },
  }).jpeg().toBuffer();
  const optimized = await sharp(original).resize(4, 4).webp().toBuffer();
  const metadata = await sharp(optimized).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 4);
  assert.equal(metadata.height, 4);
});
