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
  fragrance: "",
  bloomSize: "",
  scapeHeight: "",
  bloomSeason: "",
  rebloom: false,
  forSale: false,
  photo: false,
  price: "",
  page: 0,
};

export type CatalogFilters = typeof defaultCatalogFilters;

export type CatalogFilterOptions = {
  chars: string[];
  lists: string[];
  hybridizers: string[];
  years: string[];
  ploidies: string[];
  forms: string[];
  foliageTypes: string[];
  fragrances: string[];
  bloomSeasons: string[];
  /** Quick filters only appear where they would actually narrow results. */
  canFilterForSale: boolean;
  canFilterPhoto: boolean;
};

export type CatalogFilterKey = Exclude<keyof CatalogFilters, "page">;

/** Filters shown in the basic search panel; everything else is advanced. */
export const BASIC_FILTER_KEYS: CatalogFilterKey[] = [
  "name",
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
  note: "Note",
  fragrance: "Fragrance",
  bloomSize: "Bloom size",
  scapeHeight: "Scape height",
  bloomSeason: "Bloom season",
  rebloom: "Rebloomers only",
  forSale: "For sale",
  photo: "Has photo",
  price: "Price",
};

export const BLOOM_SIZE_OPTIONS = [
  { value: "miniature", label: 'Miniature (up to 3")' },
  { value: "small", label: 'Small (3" - 4.5")' },
  { value: "large", label: 'Large (4.5" - 7")' },
  { value: "extraLarge", label: 'Extra-Large (more than 7")' },
];

export const SCAPE_HEIGHT_OPTIONS = [
  { value: "miniature", label: 'Miniature (up to 10")' },
  { value: "short", label: 'Short (10" - 20")' },
  { value: "medium", label: 'Medium (20" - 30")' },
  { value: "tall", label: 'Tall (30" - 40")' },
  { value: "extraTall", label: 'Extra-Tall (more than 40")' },
];

export const PRICE_OPTIONS = [
  { value: "one", label: "up to $9.99" },
  { value: "two", label: "$10 - $19.99" },
  { value: "three", label: "$20 - $29.99" },
  { value: "four", label: "$30 - $39.99" },
  { value: "five", label: "$40 - $49.99" },
  { value: "six", label: "$50 and up" },
];

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
  fragrance: getQueryString(query.fragrance) || "",
  bloomSize: getQueryString(query.bloomSize) || "",
  scapeHeight: getQueryString(query.scapeHeight) || "",
  bloomSeason: getQueryString(query.bloomSeason) || "",
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
    listings.map((listing) => listing.ahsListing?.hybridizer)
  ),
  years: uniqueSorted(listings.map((listing) => listing.ahsListing?.year))
    .sort((a, b) => sortAlphaNum(a, b))
    .reverse(),
  ploidies: uniqueSorted(listings.map((listing) => listing.ahsListing?.ploidy)),
  forms: uniqueSorted(
    listings.map((listing) => listing.ahsListing?.form?.split(" ")[0])
  ),
  foliageTypes: uniqueSorted(
    listings.map((listing) => listing.ahsListing?.foliageType)
  ),
  fragrances: uniqueSorted(
    listings.map((listing) => listing.ahsListing?.fragrance)
  ),
  bloomSeasons: uniqueSorted(
    listings.map((listing) => listing.ahsListing?.bloomSeason)
  ),
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
    if (filters.list.toLowerCase() === "no list") {
      filtered = filtered.filter(
        (listing) => !listing.lists || listing.lists.length === 0
      );
    } else {
      filtered = filtered.filter((listing) =>
        listing.lists?.some((list) =>
          list.title.toLowerCase() === filters.list.toLowerCase()
        )
      );
    }
  }

  if (filters.color) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.color
        ?.toLowerCase()
        .includes(filters.color.toLowerCase())
    );
  }

  if (filters.note) {
    filtered = filtered.filter((listing) =>
      listing.description?.toLowerCase().includes(filters.note.toLowerCase())
    );
  }

  if (filters.hybridizer) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.hybridizer?.toLowerCase() === filters.hybridizer.toLowerCase()
    );
  }

  if (filters.year) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.year === filters.year
    );
  }

  if (filters.ploidy) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.ploidy?.toLowerCase() === filters.ploidy.toLowerCase()
    );
  }

  if (filters.form) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.form
        ?.toLowerCase()
        .includes(filters.form.toLowerCase())
    );
  }

  if (filters.foliageType) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.foliageType?.toLowerCase() === filters.foliageType.toLowerCase()
    );
  }

  if (filters.fragrance) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.fragrance?.toLowerCase() === filters.fragrance.toLowerCase()
    );
  }

  if (filters.bloomSeason) {
    filtered = filtered.filter(
      (listing) =>
        listing.ahsListing?.bloomSeason?.toLowerCase() ===
        filters.bloomSeason.toLowerCase()
    );
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

  if (filters.bloomSize) {
    let low = 0;
    let high = Infinity;

    switch (filters.bloomSize) {
      case "miniature":
        high = 3;
        break;
      case "small":
        low = 3;
        high = 4.5;
        break;
      case "large":
        low = 4.5;
        high = 7;
        break;
      case "extraLarge":
        low = 7;
        break;
    }

    filtered = filtered.filter((listing) => {
      const size = parseLeadingNumber(listing.ahsListing?.bloomSize);
      return size && size > low && size <= high;
    });
  }

  if (filters.scapeHeight) {
    let low = 0;
    let high = Infinity;

    switch (filters.scapeHeight) {
      case "miniature":
        high = 10;
        break;
      case "short":
        low = 10;
        high = 20;
        break;
      case "medium":
        low = 20;
        high = 30;
        break;
      case "tall":
        low = 30;
        high = 40;
        break;
      case "extraTall":
        low = 40;
        break;
    }

    filtered = filtered.filter((listing) => {
      const size = parseLeadingNumber(listing.ahsListing?.scapeHeight);
      return size && size > low && size <= high;
    });
  }

  if (filters.price) {
    let low = 0;
    let high = Infinity;

    switch (filters.price) {
      case "one":
        high = 9.99;
        break;
      case "two":
        low = 10;
        high = 19.99;
        break;
      case "three":
        low = 20;
        high = 29.99;
        break;
      case "four":
        low = 30;
        high = 39.99;
        break;
      case "five":
        low = 40;
        high = 49.99;
        break;
      case "six":
        low = 50;
        high = Infinity;
        break;
    }

    filtered = filtered.filter(
      (listing) => listing.price != null && listing.price > 0 && listing.price >= low && listing.price <= high
    );
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
