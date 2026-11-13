export const selectedValues = (value: string) =>
  Array.from(new Set(value.split("|").map((part) => part.trim()).filter(Boolean)));

const formPatterns: [string, RegExp][] = [
  ["Unusual", /unusual(?:\s+form)?/i],
  ["Double", /double(?:\s+\d+%)?/i],
  ["Polymerous", /polymerous(?:\s+\d+%)?/i],
  ["Spider", /spider(?:\s+\d+(?:\.\d+)?:1)?/i],
  ["Cascade", /cas(?:c)?ade/i],
  ["Crispate", /crispate/i],
  ["Spatulate", /spatulate/i],
  ["Pinched", /pinched/i],
  ["Quilled", /quilled/i],
  ["Twisted", /twisted/i],
  ["Pleated", /pleated/i],
  ["Sculpted", /sculpted/i],
  ["Single", /single/i],
  ["Star", /star/i],
  ["Variable", /variable/i],
];

export function formValues(value: string | null | undefined) {
  if (!value) return [];
  const matches = formPatterns.filter(([, pattern]) => pattern.test(value));
  return matches.length ? matches.map(([label]) => label) : selectedValues(value);
}

export const matchesSelected = (values: string[], selection: string) => {
  const selected = selectedValues(selection).map((value) => value.toLowerCase());
  return values.some((value) => selected.includes(value.trim().toLowerCase()));
};

export const BLOOM_SEASONS = [
  "Extra Early", "Early", "Early-Midseason", "Midseason", "Late-Midseason", "Late", "Very Late",
];

export const seasonValues = (value: string | null | undefined) =>
  selectedValues(value ?? "").map((season) => season === "Mid-Late" ? "Late-Midseason" : season);

export const habitValues = (value: string | null | undefined) =>
  selectedValues((value ?? "").replaceAll(",", "|"));
