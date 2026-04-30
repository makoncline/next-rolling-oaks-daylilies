import React from "react";
import Layout from "../components/layout";
import { CatalogCard } from "../components/catalogCard";
import { NextPage } from "next";
import { Heading } from "components/ui";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import { getPublicSnapshot, PublicCatalogSummary } from "../lib/publicSnapshot";

const Catalogs: NextPage<{ catalogs: PublicCatalogSummary[] }> = ({
  catalogs,
}) => {
  return (
    <Layout>
      <Heading level={1}>Catalogs</Heading>
      {catalogs.length === 0 && <p>No Catalogs Available.</p>}
      {catalogs.map((node, index) => (
        <CatalogCard
          key={node.slug}
          image={node.image || PLACEHOLDER_IMAGE_URL}
          name={node.name}
          intro={node.intro}
          numListings={node.totalCount}
          slug={node.slug}
          priority={index === 0}
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
