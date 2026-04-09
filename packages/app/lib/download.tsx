import type { AhsDisplay } from "./cultivarDisplay";

type DownloadableLily = {
  title?: string;
  price?: number | null;
  description?: string | null;
  privateNote?: string | null;
  images?: { url: string }[];
  ahsListing?: AhsDisplay | null;
};

function download(lilies: DownloadableLily[]): string {
  const columns = [
    "name",
    "price",
    "publicNote",
    "privateNote",
    "imgUrl",
    "hybridizer",
    "year",
    "parentage",
    "color",
    "ploidy",
    "bloomSeason",
    "bloomHabit",
    "budcount",
    "branches",
    "bloomSize",
    "scapeHeight",
    "foliageType",
    "seedlingNum",
    "fragrance",
    "form",
    "foliage",
    "flower",
    "sculpting",
  ];

  enum ahsProps {
    hybridizer = "hybridizer",
    year = "year",
    parentage = "parentage",
    color = "color",
    ploidy = "ploidy",
    bloomSeason = "bloomSeason",
    bloomHabit = "bloomHabit",
    budcount = "budcount",
    branches = "branches",
    bloomSize = "bloomSize",
    scapeHeight = "scapeHeight",
    foliageType = "foliageType",
    seedlingNum = "seedlingNum",
    fragrance = "fragrance",
    form = "form",
    foliage = "foliage",
    flower = "flower",
    sculpting = "sculpting",
  }

  const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

  const header = columns
    .map((column, i) => {
      if (i === columns.length - 1) {
        return `${column}\r\n`;
      }
      return `${column}\t`;
    })
    .join("");

  let output = header;

  lilies.forEach((lily, i) => {
    let row = ``;
    columns.forEach((column, j) => {
      if (column === "name") {
        row += `${lily.title || ""}`;
      } else if (column === "price") {
        row += `${lily.price ?? ""}`;
      } else if (column === "publicNote") {
        row += `${lily.description || ""}`;
      } else if (column === "privateNote") {
        row += `${lily.privateNote || ""}`;
      } else if (column === "imgUrl") {
        const imgUrls = lily.images?.map((image) => image.url) || [];
        const fallbackImage = lily.ahsListing?.ahsImageUrl;
        const displayUrls =
          imgUrls.length > 0
            ? imgUrls
            : fallbackImage
            ? [fallbackImage]
            : [];
        const urls =
          displayUrls.map((url) => `"${encodeURI(url)}"`).join(", ") || null;
        row += `${urls || ""}`;
      } else if (
        lily.ahsListing &&
        getKeyValue(lily.ahsListing, column as ahsProps)
      ) {
        row += `${getKeyValue(lily.ahsListing, column as ahsProps) || ""}`;
      }
      if (j !== columns.length - 1) {
        row += `\t`;
      }
    });

    if (i !== lilies.length - 1) {
      row += `\r\n`;
    }
    output += row;
  });
  return output;
}

export default download;
