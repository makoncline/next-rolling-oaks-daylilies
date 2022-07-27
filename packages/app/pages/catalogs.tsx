import React from "react";
import styled from "styled-components";
import slugify from "slugify";
import Layout from "../components/layout";
import CatalogCard from "../components/catalogCard";
import Head from "../components/head";
import Container from "../components/container";
import { lists, users, lilies, PrismaClient } from "@prisma/client";
import { NextPage } from "next";
import { siteConfig } from "../siteConfig";

const Header: () => JSX.Element = () => <Head title="Catalogs" />;

const Catalogs: NextPage<{ catalogs: Catalog[] }> = ({ catalogs }) => {
  return (
    <Layout>
      <Style>
        <Container
          head={Header()}
          content={
            <div className="catalogs">
              {catalogs &&
                catalogs.map((node) => (
                  <CatalogCard key={node.slug} catalog={node} />
                ))}
            </div>
          }
        />
      </Style>
    </Layout>
  );
};

export default Catalogs;

const Style = styled.div`
  .catalogs {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

export type Catalog = {
  slug: string;
  name: string;
  intro: string | null;
  totalCount: number;
  imgUrls: string[];
};

export async function getStaticProps() {
  const prisma = new PrismaClient();
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
      where: { list_id: list.id, img_url: { isEmpty: false } },
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
      imgUrls: listImages,
    });
  }

  const allListingCountQuery = await prisma.lilies.aggregate({
    _count: true,
  });
  const allListingImages = Object.values(listsImages).flat();
  const allCatalog = {
    slug: "all",
    name: "All Rolling Oaks Daylilies",
    intro: `View all of my daylilies in a single list. This is a great place to start if you're searching for something specific.`,
    totalCount: allListingCountQuery._count,
    imgUrls: allListingImages,
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
    imgUrls: forSalesListingImagesQuery.flatMap((l) => l.img_url),
  };

  return {
    props: { catalogs: [allCatalog, ...catalogs, forSaleCatalog] },
  };
}
