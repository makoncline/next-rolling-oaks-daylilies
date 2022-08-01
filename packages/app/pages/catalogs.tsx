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
  const lists = await prisma.lists.findMany({
    where: { user_id: siteConfig.userId },
  });
  const listingCounts: Record<number, number> = {};
  for (const list of lists) {
    const listingCountQuery = await prisma.lilies.aggregate({
      where: { list_id: list.id },
      _count: true,
    });
    listingCounts[list.id] = listingCountQuery._count;
  }
  const listsImages: Record<number, string[]> = {};
  const catalogs: Catalog[] = [];
  for (const list of lists) {
    const listCountQuery = await prisma.lilies.aggregate({
      where: { list_id: list.id },
      _count: true,
    });
    const listingImageQuery = await prisma.lilies.findMany({
      where: {
        list_id: list.id,
        img_url: { isEmpty: false },
      },
      orderBy: { updated_at: "desc" },
      select: { img_url: true },
    });
    const listImages = listingImageQuery.flatMap((l) => l.img_url);
    listsImages[list.id] = listImages;
    catalogs.push({
      slug: slugify(list.name),
      name: list.name,
      intro: list.intro,
      totalCount: listCountQuery._count,
      image: randomImageUrl(listImages),
    });
  }

  const allListingCountQuery = await prisma.lilies.aggregate({
    where: { user_id: siteConfig.userId },
    _count: true,
  });
  const allListingImages = Object.values(listsImages).flat();
  const allCatalog = {
    slug: "all",
    name: "All Rolling Oaks Daylilies",
    intro: `View all of my daylilies in a single list. This is a great place to start if you're searching for something specific.`,
    totalCount: allListingCountQuery._count,
    image: randomImageUrl(allListingImages),
  };

  const forSaleListingCountQuery = await prisma.lilies.aggregate({
    where: { price: { gt: 0 } },
    _count: true,
  });
  const forSalesListingImagesQuery = await prisma.lilies.findMany({
    where: { price: { gt: 0 }, img_url: { isEmpty: false } },
    select: { img_url: true },
  });
  const forSaleCatalog = {
    slug: "for-sale",
    name: "For Sale",
    intro: `Daylilies available for purchase. Send me a message to check availability`,
    totalCount: forSaleListingCountQuery._count,
    image: randomImageUrl(forSalesListingImagesQuery.flatMap((l) => l.img_url)),
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

const randomImageUrl = (imageUrls: string[]) =>
  imageUrls ? imageUrls[Math.floor(Math.random() * imageUrls.length)] : null;
