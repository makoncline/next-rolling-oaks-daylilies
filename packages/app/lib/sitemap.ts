import { siteConfig } from "siteConfig";
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
    getSitemapEntry("/blog", new Date()),
    getSitemapEntry("/blog/dorothy-and-toto", new Date()),
  ];

  const catalogs = await prisma.list.findMany({
    select: {
      title: true,
      updatedAt: true,
      listings: {
        select: {
          updatedAt: true,
        },
        where: {
          OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
        },
        orderBy: {
          updatedAt: "asc",
        },
        take: 1,
      },
    },
    where: { userId: siteConfig.userId },
  });

  const filteredCatalogs = catalogs.filter(
    (catalog) => catalog.listings.length > 0
  );

  const catalogUrls = filteredCatalogs.map((catalog) => {
    return getSitemapEntry(
      `/catalog/${catalog.title.toLowerCase().replace(/\s+/g, "-")}`,
      catalog.listings[0].updatedAt
    );
  });

  const listings = await prisma.listing.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    where: {
      userId: siteConfig.userId,
      OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
    },
  });

  const listingUrls = listings.map((listing) =>
    getSitemapEntry(`/${listing.slug}`, listing.updatedAt)
  );

  return [...staticUrls, ...catalogUrls, ...listingUrls];
};
