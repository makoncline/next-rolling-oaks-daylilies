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
};

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
          list.title.toLowerCase().includes(filters.list.toLowerCase())
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
      listing.ahsListing?.hybridizer
        ?.toLowerCase()
        .includes(filters.hybridizer.toLowerCase())
    );
  }

  if (filters.year) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.year?.includes(filters.year)
    );
  }

  if (filters.ploidy) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.ploidy
        ?.toLowerCase()
        .includes(filters.ploidy.toLowerCase())
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
      listing.ahsListing?.foliageType
        ?.toLowerCase()
        .includes(filters.foliageType.toLowerCase())
    );
  }

  if (filters.fragrance) {
    filtered = filtered.filter((listing) =>
      listing.ahsListing?.fragrance
        ?.toLowerCase()
        .includes(filters.fragrance.toLowerCase())
    );
  }

  if (filters.bloomSeason) {
    filtered = filtered.filter(
      (listing) =>
        listing.ahsListing?.bloomSeason?.toLowerCase() ===
        filters.bloomSeason.toLowerCase()
    );
  }

  if (filters.bloomSize) {
    let low = 0;
    let high = 1000;

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
    let high = 1000;

    switch (filters.scapeHeight) {
      case "miniature":
        high = 10;
        break;
      case "short":
        low = 10.1;
        high = 20;
        break;
      case "medium":
        low = 20.1;
        high = 30;
        break;
      case "tall":
        low = 30.1;
        high = 40;
        break;
      case "extraTall":
        low = 40.1;
        break;
    }

    filtered = filtered.filter((listing) => {
      const size = parseLeadingNumber(listing.ahsListing?.scapeHeight);
      return size && size > low && size <= high;
    });
  }

  if (filters.price) {
    let low = 0;
    let high = 1000;

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
        high = 999;
        break;
    }

    filtered = filtered.filter(
      (listing) => listing.price != null && listing.price > low && listing.price <= high
    );
  }

  return sortTitlesLettersBeforeNumbers(filtered);
};

export const getCatalogSearchResult = (
  listings: PublicListingCard[],
  filters: CatalogFilters,
  limit = CATALOG_PAGE_LIMIT
) => {
  const filteredListings = filterCatalogListings(listings, filters);
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
