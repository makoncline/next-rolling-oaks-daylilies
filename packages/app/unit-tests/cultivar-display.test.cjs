const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename);
const {
  mapLegacyAhsListingToAhsDisplay,
  mapV2CultivarToAhsDisplay,
} = jiti("../lib/cultivarDisplay.ts");

test("cultivar display keeps v2 images and ignores deprecated v1 images", () => {
  const legacyImageUrl =
    "https://www.daylilydatabase.org/AHSPhoto/example.jpg";
  const legacyDisplay = mapLegacyAhsListingToAhsDisplay({
    name: "Legacy cultivar",
    ahsImageUrl: legacyImageUrl,
  });

  assert.equal(legacyDisplay.name, "Legacy cultivar");
  assert.equal(legacyDisplay.ahsImageUrl, null);

  const v2ImageUrl = "https://www.daylilies.org/Gallery/example.jpg";
  const v2Display = mapV2CultivarToAhsDisplay(
    {
      post_title: "V2 cultivar",
      image_url: v2ImageUrl,
    },
    {
      name: "Legacy cultivar",
      ahsImageUrl: legacyImageUrl,
    }
  );

  assert.equal(v2Display.ahsImageUrl, v2ImageUrl);
});
