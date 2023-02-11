import { siteConfig } from "siteConfig";
import slugify from "slugify";
import { prisma } from "../prisma/db";

export const getSitemapEntry = (path: string, lastmod: Date) => {
  return `
      <url>
        <loc>${siteConfig.baseUrl}${path}</loc>
        <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
      </url>
    `;
};

export const getSitemapUrls = async () => {
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
  return [...staticUrls, ...catalogUrls, ...listingUrls];
};
