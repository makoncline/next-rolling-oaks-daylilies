import React from "react";
import Layout from "../components/layout";
import { CatalogCard } from "../components/catalogCard";
import { NextPage } from "next";
import { Heading } from "@packages/design-system";
import { getPlaceholderImageUrl } from "lib/getPlaceholderImage";
import { getPublicSnapshot, PublicCatalogSummary } from "../lib/publicSnapshot";

const Catalogs: NextPage<{ catalogs: PublicCatalogSummary[] }> = ({
  catalogs,
}) => {
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

export async function getServerSideProps() {
  const snapshot = await getPublicSnapshot();
  const realCatalogs = Object.values(snapshot.catalogsBySlug)
    .filter((catalog) => !["all", "search", "for-sale"].includes(catalog.slug))
    .sort((a, b) => b.totalCount - a.totalCount);

  return {
    props: {
      catalogs: [
        snapshot.catalogsBySlug["for-sale"],
        ...realCatalogs,
        snapshot.catalogsBySlug.all,
      ].filter(Boolean),
    },
  };
}
