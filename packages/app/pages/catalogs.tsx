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

type ImageRow = {
  url: string;
};

const randomListImageUrl = async (listId: string) => {
  const rows = await prisma.$queryRaw<ImageRow[]>`
    SELECT Image.url
    FROM Image
    JOIN Listing ON Listing.id = Image.listingId
    JOIN _ListToListing ON _ListToListing.B = Listing.id
    WHERE _ListToListing.A = ${listId}
      AND Listing.userId = ${siteConfig.userId}
      AND (Listing.status IS NULL OR Listing.status != 'HIDDEN')
    ORDER BY RANDOM()
    LIMIT 1
  `;

  return rows[0]?.url ?? null;
};

const randomAllListingsImageUrl = async () => {
  const rows = await prisma.$queryRaw<ImageRow[]>`
    SELECT Image.url
    FROM Image
    JOIN Listing ON Listing.id = Image.listingId
    WHERE Listing.userId = ${siteConfig.userId}
      AND (Listing.status IS NULL OR Listing.status != 'HIDDEN')
    ORDER BY RANDOM()
    LIMIT 1
  `;

  return rows[0]?.url ?? null;
};

const randomForSaleImageUrl = async () => {
  const rows = await prisma.$queryRaw<ImageRow[]>`
    SELECT Image.url
    FROM Image
    JOIN Listing ON Listing.id = Image.listingId
    WHERE Listing.userId = ${siteConfig.userId}
      AND Listing.price > 0
      AND (Listing.status IS NULL OR Listing.status != 'HIDDEN')
    ORDER BY RANDOM()
    LIMIT 1
  `;

  return rows[0]?.url ?? null;
};

export async function getServerSideProps() {
  const lists = await prisma.list.findMany({
    where: { userId: siteConfig.userId },
  });

  const catalogs = await Promise.all(
    lists.map(async (list) => {
      const [totalCount, image] = await Promise.all([
        prisma.listing.count({
          where: {
            lists: { some: { id: list.id } },
            OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
          },
        }),
        randomListImageUrl(list.id),
      ]);

      return {
        slug: list.title.toLowerCase().replace(/\s+/g, "-"),
        name: list.title,
        intro: list.description,
        totalCount,
        image,
      };
    })
  );

  // All listings catalog
  const [allListingCountQuery, allListingImage] = await Promise.all([
    prisma.listing.count({
      where: {
        userId: siteConfig.userId,
        OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
      },
    }),
    randomAllListingsImageUrl(),
  ]);

  const allCatalog = {
    slug: "all",
    name: "All Rolling Oaks Daylilies",
    intro: `View all of my daylilies in a single list. This is a great place to start if you're searching for something specific.`,
    totalCount: allListingCountQuery,
    image: allListingImage,
  };

  // For sale catalog
  const [forSaleListingCountQuery, forSaleImage] = await Promise.all([
    prisma.listing.count({
      where: {
        price: { gt: 0 },
        userId: siteConfig.userId,
        OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
      },
    }),
    randomForSaleImageUrl(),
  ]);

  const forSaleCatalog = {
    slug: "for-sale",
    name: "For Sale",
    intro: `Daylilies available for purchase. Send me a message to check availability`,
    totalCount: forSaleListingCountQuery,
    image: forSaleImage,
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
