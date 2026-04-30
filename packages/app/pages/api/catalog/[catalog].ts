import type { NextApiRequest, NextApiResponse } from "next";
import {
  getCatalogListings,
  getPublicSnapshot,
} from "../../../lib/publicSnapshot";
import { paginateListings } from "../../../lib/publicApi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const catalogSlug = Array.isArray(req.query.catalog)
    ? req.query.catalog[0]
    : req.query.catalog;

  if (!catalogSlug) {
    res.status(400).json({ error: "Catalog slug is required" });
    return;
  }

  const snapshot = await getPublicSnapshot();
  const catalog = snapshot.catalogsBySlug[catalogSlug];

  if (!catalog) {
    res.status(404).json({ error: "Catalog not found" });
    return;
  }

  const { listings, pagination } = paginateListings(
    getCatalogListings(snapshot, catalogSlug),
    req.query
  );

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600"
  );
  res.status(200).json({
    catalog: {
      slug: catalog.slug,
      name: catalog.name,
      intro: catalog.intro,
      image: catalog.image,
      totalCount: catalog.totalCount,
      url: `/catalog/${catalog.slug}`,
    },
    pagination,
    listings: listings.map((listing) => ({
      ...listing,
      url: `/${listing.slug}`,
      apiUrl: `/api/listings/${listing.slug}`,
    })),
  });
}
