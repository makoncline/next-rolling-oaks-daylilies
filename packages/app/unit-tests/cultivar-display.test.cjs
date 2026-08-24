const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename);
const {
  mapLegacyAhsListingToAhsDisplay,
  mapV2CultivarToAhsDisplay,
} = jiti("../lib/cultivarDisplay.ts");
const {
  defaultCatalogFilters,
  filterCatalogListings,
  getCatalogFilterOptions,
} = jiti("../lib/catalogSearch.ts");

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

test("catalog search combines bloom season with the v2 rebloom flag", () => {
  const rebloomer = mapV2CultivarToAhsDisplay({
    post_title: "Repeat Performer",
    bloom_season_names: "Midseason",
    rebloom: 1,
  });
  const singleBloom = mapV2CultivarToAhsDisplay({
    post_title: "Once in Summer",
    bloom_season_names: "Midseason",
    rebloom: 0,
  });
  const listings = [
    { id: "rebloomer", title: "Repeat Performer", ahsListing: rebloomer },
    { id: "single-bloom", title: "Once in Summer", ahsListing: singleBloom },
  ];

  assert.deepEqual(getCatalogFilterOptions(listings).bloomSeasons, [
    "Midseason",
  ]);
  assert.deepEqual(
    filterCatalogListings(listings, {
      ...defaultCatalogFilters,
      bloomSeason: "Midseason",
      rebloom: true,
    }).map((listing) => listing.id),
    ["rebloomer"]
  );
});
