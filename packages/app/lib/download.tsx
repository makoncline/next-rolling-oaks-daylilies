function download(lilies: any[]): string {
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
      if (
        column === "name" ||
        column === "price" ||
        column === "publicNote" ||
        column === "privateNote"
      ) {
        row += `${lily[column] || ""}`;
      } else if (column === "imgUrl") {
        const imgUrls = lily.imgUrl;
        const urls =
          imgUrls?.map((url: string) => `"${encodeURI(url)}"`).join(", ") ??
          null;
        row += `${urls || ""}`;
      } else if (
        lily.ahsDatumByAhsRef &&
        getKeyValue(lily.ahsDatumByAhsRef, column as ahsProps)
      ) {
        row += `${
          getKeyValue(lily.ahsDatumByAhsRef, column as ahsProps) || ""
        }`;
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
