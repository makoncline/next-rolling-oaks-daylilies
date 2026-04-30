import type { NextApiRequest, NextApiResponse } from "next";
import { getPublicSnapshot } from "../../lib/publicSnapshot";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const snapshot = await getPublicSnapshot();

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600"
  );
  res.status(200).json({
    catalogs: Object.values(snapshot.catalogsBySlug).map((catalog) => ({
      slug: catalog.slug,
      name: catalog.name,
      intro: catalog.intro,
      image: catalog.image,
      totalCount: catalog.totalCount,
      url: `/catalog/${catalog.slug}`,
      apiUrl: `/api/catalog/${catalog.slug}`,
    })),
  });
}
