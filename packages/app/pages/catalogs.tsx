import React from "react";
import slugify from "slugify";
import Layout from "../components/layout";
import { CatalogCard } from "../components/catalogCard";
import { NextPage } from "next";
import { siteConfig } from "../siteConfig";
import { prisma } from "../prisma/db";
import { Heading } from "@packages/design-system";
import { getPlaceholderImageUrl } from "lib/getPlaceholderImage";

const Catalogs: NextPage<{ catalogs: Catalog[] }> = ({ catalogs }) => {
  return (
    <Layout>
      <Heading level={1}>Catalogs</Heading>
      {catalogs.map((node) => (
        <CatalogCard
          key={node.slug}
          image={node.image || getPlaceholderImageUrl(node.slug)}
          name={node.name}
          intro={node.intro}
          numListings={node.totalCount}
          slug={node.slug}
        />
      ))}
    </Layout>
  );
};

export default Catalogs;

export type Catalog = {
  slug: string;
  name: string;
  intro: string | null;
  totalCount: number;
  image: string | null;
};

export async function getStaticProps() {
  const lists = await prisma.list.findMany({
    where: { userId: siteConfig.userId },
  });

  const catalogs: Catalog[] = [];
  const listsImages: Record<string, string[]> = {};

  for (const list of lists) {
    // Count listings for this list
    const listCountQuery = await prisma.listing.count({
      where: {
        lists: { some: { id: list.id } },
        OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
      },
    });

    // Get images for listings in this list
    const listingImageQuery = await prisma.image.findMany({
      where: {
        listing: {
          lists: { some: { id: list.id } },
          OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
        },
      },
      orderBy: { updatedAt: "desc" },
      select: { url: true },
    });

    const listImages = listingImageQuery.map((img) => img.url);
    listsImages[list.id] = listImages;

    catalogs.push({
      slug: list.title.toLowerCase().replace(/\s+/g, "-"),
      name: list.title,
      intro: list.description,
      totalCount: listCountQuery,
      image: randomImageUrl(listImages),
    });
  }

  // All listings catalog
  const allListingCountQuery = await prisma.listing.count({
    where: {
      userId: siteConfig.userId,
      OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
    },
  });

  const allListingImages = Object.values(listsImages).flat();
  const allCatalog = {
    slug: "all",
    name: "All Rolling Oaks Daylilies",
    intro: `View all of my daylilies in a single list. This is a great place to start if you're searching for something specific.`,
    totalCount: allListingCountQuery,
    image: randomImageUrl(allListingImages),
  };

  // For sale catalog
  const forSaleListingCountQuery = await prisma.listing.count({
    where: {
      price: { gt: 0 },
      userId: siteConfig.userId,
      OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
    },
  });

  const forSalesListingImagesQuery = await prisma.image.findMany({
    where: {
      listing: {
        price: { gt: 0 },
        userId: siteConfig.userId,
        OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
      },
    },
    select: { url: true },
  });

  const forSaleCatalog = {
    slug: "for-sale",
    name: "For Sale",
    intro: `Daylilies available for purchase. Send me a message to check availability`,
    totalCount: forSaleListingCountQuery,
    image: randomImageUrl(forSalesListingImagesQuery.map((img) => img.url)),
  };

  return {
    props: {
      catalogs: [
        forSaleCatalog,
        ...catalogs.sort((a, b) => b.totalCount - a.totalCount),
        allCatalog,
      ],
    },
  };
}

const randomImageUrl = (imageUrls: string[]): string | null => {
  if (imageUrls.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  return imageUrls[randomIndex];
};
