import { catalogRangeFields, matchesRange, rangeBounds, type CatalogRangeKey, type RangeBounds } from "./catalogRanges";
import { BLOOM_SEASONS, formValues, habitValues, matchesSelected, selectedValues, seasonValues } from "./catalogTraits";
import type { ParsedUrlQuery } from "querystring";
import { parseLeadingNumber } from "./cultivarDisplay";
import { sortTitlesLettersBeforeNumbers } from "./sort";
import type { PublicListRef, PublicListingCard } from "./publicSnapshot";

export const CATALOG_PAGE_LIMIT = 24;

export const defaultCatalogFilters = {
  name: "",
  list: "",
  char: "",
  hybridizer: "",
  year: "",
  ploidy: "",
  color: "",
  form: "",
  foliageType: "",
  note: "",
  parentage: "",
  fragrance: "",
  bloomSize: "",
  scapeHeight: "",
  bloomSeason: "",
  bloomHabit: "",
  budcount: "",
  branches: "",
  rebloom: false,
  forSale: false,
  photo: false,
  price: "",
  page: 0,
};

export type CatalogFilters = typeof defaultCatalogFilters;

export type CatalogFilterOptions = {
  ranges: Record<CatalogRangeKey, RangeBounds>;
  chars: string[];
  lists: string[];
  hybridizers: string[];
  ploidies: string[];
  forms: string[];
  foliageTypes: string[];
  fragrances: string[];
  bloomSeasons: string[];
  bloomHabits: string[];
  /** Quick filters only appear where they would actually narrow results. */
  canFilterForSale: boolean;
  canFilterPhoto: boolean;
};

export type CatalogFilterKey = Exclude<keyof CatalogFilters, "page">;

/** Filters shown in the basic search panel; everything else is advanced. */
export const BASIC_FILTER_KEYS: CatalogFilterKey[] = [
  "name",
  "list",
  "forSale",
  "photo",
  "rebloom",
];

export const CATALOG_FILTER_LABELS: Record<CatalogFilterKey, string> = {
  name: "Name",
  list: "List",
  char: "First character",
  hybridizer: "Hybridizer",
  year: "Year",
  ploidy: "Ploidy",
  color: "Color",
  form: "Form",
  foliageType: "Foliage type",
  note: "Description",
  parentage: "Parentage",
  fragrance: "Fragrance",
  bloomSize: "Bloom size",
  scapeHeight: "Scape height",
  bloomSeason: "Bloom season",
  bloomHabit: "Bloom habit",
  budcount: "Bud count",
  branches: "Branches",
  rebloom: "Rebloomers only",
  forSale: "For sale",
  photo: "Has photo",
  price: "Price",
};

export const getActiveFilterKeys = (filters: CatalogFilters) =>
  (Object.keys(CATALOG_FILTER_LABELS) as CatalogFilterKey[]).filter(
    (key) => Boolean(filters[key])
  );

export const hasActiveAdvancedFilters = (filters: CatalogFilters) =>
  getActiveFilterKeys(filters).some((key) => !BASIC_FILTER_KEYS.includes(key));

const hasPhoto = (listing: PublicListingCard) =>
  (listing.images?.length ?? 0) > 0 || Boolean(listing.ahsListing?.ahsImageUrl);

const getQueryString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const getPageFromQuery = (value: string | string[] | undefined) => {
  const page = parseInt(getQueryString(value) || "1", 10);
  if (!Number.isFinite(page) || page < 1) return 0;
  return page - 1;
};

export const getCatalogFiltersFromQuery = (
  query: ParsedUrlQuery
): CatalogFilters => ({
  ...defaultCatalogFilters,
  name: getQueryString(query.name) || "",
  char: getQueryString(query.char) || "",
  list: getQueryString(query.list) || "",
  hybridizer: getQueryString(query.hybridizer) || "",
  year: getQueryString(query.year) || "",
  ploidy: getQueryString(query.ploidy) || "",
  color: getQueryString(query.color) || "",
  form: getQueryString(query.form) || "",
  foliageType: getQueryString(query.foliageType) || "",
  note: getQueryString(query.note) || "",
  parentage: getQueryString(query.parentage) || "",
  fragrance: getQueryString(query.fragrance) || "",
  bloomSize: getQueryString(query.bloomSize) || "",
  scapeHeight: getQueryString(query.scapeHeight) || "",
  bloomSeason: getQueryString(query.bloomSeason) || "",
  bloomHabit: getQueryString(query.bloomHabit) || "",
  budcount: getQueryString(query.budcount) || "",
  branches: getQueryString(query.branches) || "",
  rebloom: getQueryString(query.rebloom) === "true",
  forSale: getQueryString(query.forSale) === "true",
  photo: getQueryString(query.photo) === "true",
  price: getQueryString(query.price) || "",
  page: getPageFromQuery(query.page),
});

const sortAlphaNum = (a: string | number, b: string | number) =>
  `${a}`.localeCompare(`${b}`, "en", { numeric: true }) < 0 ? -1 : 1;

const uniqueSorted = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.filter(Boolean) as string[])).sort((a, b) =>
    sortAlphaNum(a, b)
  );

export const getCatalogFilterOptions = (
  listings: PublicListingCard[]
): CatalogFilterOptions => ({
  ranges: Object.fromEntries(Object.entries(catalogRangeFields).map(([key, field]) => [key, rangeBounds(listings.map(field.value))])) as Record<CatalogRangeKey, RangeBounds>,
  chars: uniqueSorted(
    listings.map(({ title }) => title.substring(0, 1).toUpperCase())
  ),
  lists: uniqueSorted(
    listings.flatMap((listing) =>
      listing.lists && listing.lists.length > 0
        ? listing.lists.map((list: PublicListRef) => list.title)
        : ["No List"]
    )
  ),
  hybridizers: uniqueSorted(
    listings.flatMap((listing) => selectedValues(listing.ahsListing?.hybridizer ?? ""))
  ),
  ploidies: uniqueSorted(listings.flatMap((listing) => selectedValues(listing.ahsListing?.ploidy ?? ""))),
  forms: uniqueSorted(
    listings.flatMap((listing) => formValues(listing.ahsListing?.form))
  ),
  foliageTypes: uniqueSorted(
    listings.flatMap((listing) => selectedValues(listing.ahsListing?.foliageType ?? ""))
  ),
  fragrances: uniqueSorted(
    listings.flatMap((listing) => selectedValues(listing.ahsListing?.fragrance ?? ""))
  ),
  bloomSeasons: BLOOM_SEASONS.filter((season) =>
    listings.some((listing) => seasonValues(listing.ahsListing?.bloomSeason).includes(season))
  ),
  bloomHabits: uniqueSorted(listings.flatMap((listing) => habitValues(listing.ahsListing?.bloomHabit))),
  canFilterForSale:
    listings.some((listing) => listing.price != null) &&
    listings.some((listing) => listing.price == null),
  canFilterPhoto:
    listings.some(hasPhoto) && listings.some((listing) => !hasPhoto(listing)),
});

export const filterCatalogListings = (
  listings: PublicListingCard[],
  filters: CatalogFilters
) => {
  let filtered = listings;

  if (filters.name) {
    filtered = filtered.filter((listing) =>
      listing.title.toLowerCase().includes(filters.name.toLowerCase())
    );
  }

  if (filters.char) {
    filtered = filtered.filter((listing) =>
      listing.title
        .substring(0, 1)
        .toLowerCase()
        .includes(filters.char.toLowerCase())
    );
  }

  if (filters.list) {
    filtered = filtered.filter((listing) => matchesSelected(
      listing.lists?.length ? listing.lists.map((list) => list.title) : ["No List"],
      filters.list
    ));
  }

  if (filters.color) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.color
        ?.toLowerCase()
        .includes(filters.color.toLowerCase())
    );
  }

  if (filters.parentage) {
    filtered = filtered.filter((listing) => listing.ahsListing?.parentage?.toLowerCase().includes(filters.parentage.toLowerCase()));
  }

  if (filters.note) {
    filtered = filtered.filter((listing) =>
      listing.description?.toLowerCase().includes(filters.note.toLowerCase())
    );
  }

  if (filters.hybridizer) {
    filtered = filtered.filter((listing) =>
      matchesSelected(selectedValues(listing.ahsListing?.hybridizer ?? ""), filters.hybridizer)
    );
  }

  if (filters.ploidy) {
    filtered = filtered.filter((listing) =>
      matchesSelected(selectedValues(listing.ahsListing?.ploidy ?? ""), filters.ploidy)
    );
  }

  if (filters.form) {
    filtered = filtered.filter((listing) =>
      matchesSelected(formValues(listing.ahsListing?.form), filters.form)
    );
  }

  if (filters.foliageType) {
    filtered = filtered.filter((listing) =>
      matchesSelected(selectedValues(listing.ahsListing?.foliageType ?? ""), filters.foliageType)
    );
  }

  if (filters.fragrance) {
    filtered = filtered.filter((listing) =>
      matchesSelected(selectedValues(listing.ahsListing?.fragrance ?? ""), filters.fragrance)
    );
  }

  if (filters.bloomSeason) {
    filtered = filtered.filter(
      (listing) =>
        matchesSelected(seasonValues(listing.ahsListing?.bloomSeason), seasonValues(filters.bloomSeason).join("|"))
    );
  }

  if (filters.bloomHabit) {
    filtered = filtered.filter((listing) => matchesSelected(habitValues(listing.ahsListing?.bloomHabit), filters.bloomHabit));
  }

  if (filters.rebloom) {
    filtered = filtered.filter(
      (listing) => listing.ahsListing?.rebloom === true
    );
  }

  if (filters.forSale) {
    filtered = filtered.filter((listing) => listing.price != null);
  }

  if (filters.photo) {
    filtered = filtered.filter(hasPhoto);
  }

  for (const key of Object.keys(catalogRangeFields) as CatalogRangeKey[]) {
    if (filters[key]) filtered = filtered.filter((listing) => matchesRange(catalogRangeFields[key].value(listing), filters[key], catalogRangeFields[key].integerOnly));
  }

  return sortTitlesLettersBeforeNumbers(filtered);
};

/** Result order. The empty value is the default name order. */
export const CATALOG_SORT_OPTIONS = [
  { value: "", label: "Name" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest registrations" },
  { value: "updated", label: "Recently updated" },
  { value: "bloom-size", label: "Largest blooms" },
] as const;

export type CatalogSort = (typeof CATALOG_SORT_OPTIONS)[number]["value"];

export const getCatalogSortFromQuery = (query: ParsedUrlQuery): CatalogSort => {
  const value = getQueryString(query.sort) || "";
  return CATALOG_SORT_OPTIONS.some((option) => option.value === value)
    ? (value as CatalogSort)
    : "";
};

const numberOrNull = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? value : null;

const sortKeys: Record<
  Exclude<CatalogSort, "">,
  { key: (listing: PublicListingCard) => number | null; descending: boolean }
> = {
  "price-asc": { key: (listing) => numberOrNull(listing.price || null), descending: false },
  "price-desc": { key: (listing) => numberOrNull(listing.price || null), descending: true },
  newest: { key: (listing) => numberOrNull(parseInt(listing.ahsListing?.year || "", 10)), descending: true },
  updated: { key: (listing) => numberOrNull(Date.parse(listing.updatedAt)), descending: true },
  "bloom-size": { key: (listing) => numberOrNull(parseLeadingNumber(listing.ahsListing?.bloomSize)), descending: true },
};

/** Listings without the sorted value keep name order after those that have it. */
export const sortCatalogListings = (
  listings: PublicListingCard[],
  sort: CatalogSort
) => {
  if (!sort) return listings;
  const { key, descending } = sortKeys[sort];
  return listings
    .map((listing, index) => ({ listing, index, value: key(listing) }))
    .sort((a, b) => {
      if (a.value === null || b.value === null) {
        if (a.value === b.value) return a.index - b.index;
        return a.value === null ? 1 : -1;
      }
      const difference = descending ? b.value - a.value : a.value - b.value;
      return difference || a.index - b.index;
    })
    .map(({ listing }) => listing);
};

export const getCatalogSearchResult = (
  listings: PublicListingCard[],
  filters: CatalogFilters,
  limit = CATALOG_PAGE_LIMIT,
  sort: CatalogSort = ""
) => {
  const filteredListings = sortCatalogListings(
    filterCatalogListings(listings, filters),
    sort
  );
  const total = filteredListings.length;
  const lastPage = Math.max(Math.ceil(total / limit) - 1, 0);
  const page = Math.min(Math.max(filters.page, 0), lastPage);

  return {
    listings: filteredListings.slice(page * limit, (page + 1) * limit),
    total,
    page,
    limit,
    lastPage,
  };
};
