import type { NextApiRequest, NextApiResponse } from "next";
import { getPublicSnapshot } from "../../../lib/publicSnapshot";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const listingSlug = Array.isArray(req.query.listing)
    ? req.query.listing[0]
    : req.query.listing;

  if (!listingSlug) {
    res.status(400).json({ error: "Listing slug is required" });
    return;
  }

  const snapshot = await getPublicSnapshot();
  const listing = snapshot.detailsBySlug[listingSlug];

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600"
  );
  res.status(200).json({
    listing: {
      ...listing,
      url: `/${listing.slug}`,
      apiUrl: `/api/listings/${listing.slug}`,
    },
  });
}
