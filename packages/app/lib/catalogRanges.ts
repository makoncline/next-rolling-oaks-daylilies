import { parseLeadingNumber } from "./cultivarDisplay";
import type { PublicListingCard } from "./publicSnapshot";

export const catalogRangeFields = {
  year: { label: "Year", unit: "", integerOnly: true, value: (listing: PublicListingCard) => parseLeadingNumber(listing.ahsListing?.year) },
  bloomSize: { label: "Bloom size", unit: "in.", integerOnly: false, value: (listing: PublicListingCard) => parseLeadingNumber(listing.ahsListing?.bloomSize) },
  scapeHeight: { label: "Scape height", unit: "in.", integerOnly: false, value: (listing: PublicListingCard) => parseLeadingNumber(listing.ahsListing?.scapeHeight) },
  budcount: { label: "Bud count", unit: "", integerOnly: true, value: (listing: PublicListingCard) => parseLeadingNumber(listing.ahsListing?.budcount) },
  branches: { label: "Branches", unit: "", integerOnly: true, value: (listing: PublicListingCard) => parseLeadingNumber(listing.ahsListing?.branches) },
  price: { label: "Price", unit: "$", integerOnly: false, value: (listing: PublicListingCard) => listing.price },
};
export type CatalogRangeKey = keyof typeof catalogRangeFields;
export type RangeBounds = { min: number; max: number };

export function parseRange(value: string): [number | null, number | null] | null {
  const parts = value.split(":");
  if (parts.length !== 2 || parts.every((part) => !part)) return null;
  if (parts.some((part) => part && !/^\d+(?:\.\d+)?$/.test(part))) return null;
  const min = parts[0] ? Number(parts[0]) : null;
  const max = parts[1] ? Number(parts[1]) : null;
  if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) return null;
  if (min !== null && max !== null && min > max) return null;
  return [min, max];
}

export function matchesRange(value: number | null, selection: string, integerOnly: boolean) {
  const range = parseRange(selection);
  return range !== null && (!integerOnly || range.every((bound) => bound === null || Number.isInteger(bound))) && value !== null && Number.isFinite(value) &&
    (range[0] === null || value >= range[0]) && (range[1] === null || value <= range[1]);
}

export function rangeBounds(values: Array<number | null>): RangeBounds {
  const numbers = values.filter((value): value is number => value !== null && Number.isFinite(value) && value >= 0);
  return numbers.length ? { min: Math.floor(Math.min(...numbers)), max: Math.ceil(Math.max(...numbers)) } : { min: 0, max: 1 };
}

export function describeRange(key: CatalogRangeKey, value: string) {
  const range = parseRange(value);
  if (!range) return value;
  const { unit } = catalogRangeFields[key];
  const format = (number: number) => unit === "$" ? `$${number}` : `${number}${unit ? ` ${unit}` : ""}`;
  const [min, max] = range;
  if (min === null) return `up to ${format(max!)}`;
  if (max === null) return `at least ${format(min)}`;
  return min === max ? format(min) : `${format(min)} – ${format(max)}`;
}
