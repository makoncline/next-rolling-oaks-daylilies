import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/db";
import slugify from "slugify";
import { siteConfig } from "siteConfig";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  const staticUrls = [
    getSitemapEntry("", new Date()),
    getSitemapEntry("/", new Date()),
    getSitemapEntry("/catalogs", new Date()),
    getSitemapEntry("/catalog/all", new Date()),
    getSitemapEntry("/catalog/search", new Date()),
    getSitemapEntry("/catalog/for-sale", new Date()),
    getSitemapEntry("/cart", new Date()),
    getSitemapEntry("/thanks", new Date()),
  ];

  const catalogs = await prisma.lists.findMany({
    select: {
      name: true,
      updated_at: true,
      lilies: {
        select: {
          updated_at: true,
        },
        orderBy: {
          updated_at: "asc",
        },
        take: 1,
      },
    },
    where: { user_id: siteConfig.userId },
  });
  const filteredCatalogs = catalogs.filter(
    (catalog) => catalog.lilies.length > 0
  );
  const catalogUrls = filteredCatalogs.map((catalog) => {
    return getSitemapEntry(
      `/catalog/${slugify(catalog.name.toLowerCase(), { lower: true })}`,
      catalog.lilies[0].updated_at
    );
  });

  const listings = await prisma.lilies.findMany({
    select: {
      name: true,
      updated_at: true,
    },
    where: { user_id: siteConfig.userId },
  });
  const listingUrls = listings.map((listing) =>
    getSitemapEntry(
      `/${slugify(listing.name, { lower: true })}`,
      listing.updated_at
    )
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls.join("\n")}
    ${catalogUrls.join("\n")}
    ${listingUrls.join("\n")}
    </urlset>
  `;

  res.end(xml);
}

const getSitemapEntry = (path: string, lastmod: Date) => {
  return `
    <url>
      <loc>${siteConfig.baseUrl}${path}</loc>
      <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
    </url>
  `;
};
