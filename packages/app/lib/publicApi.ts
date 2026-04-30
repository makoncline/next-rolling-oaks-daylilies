import type { PublicListingCard } from "./publicSnapshot";

export const PUBLIC_API_DEFAULT_LIMIT = 24;
export const PUBLIC_API_MAX_LIMIT = 100;

export const getQueryString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getPositiveInteger = (
  value: string | string[] | undefined,
  fallback: number
) => {
  const parsed = Number.parseInt(getQueryString(value) || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getPagination = (query: {
  page?: string | string[];
  limit?: string | string[];
}) => {
  const page = getPositiveInteger(query.page, 1);
  const limit = Math.min(
    getPositiveInteger(query.limit, PUBLIC_API_DEFAULT_LIMIT),
    PUBLIC_API_MAX_LIMIT
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

export const paginateListings = (
  listings: PublicListingCard[],
  query: { page?: string | string[]; limit?: string | string[] }
) => {
  const { page, limit, offset } = getPagination(query);
  const total = listings.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    listings: listings.slice(offset, offset + limit),
  };
};
