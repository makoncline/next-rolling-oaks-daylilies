import React from "react";
import Layout from "../components/layout";
import { CatalogCard } from "../components/catalogCard";
import { NextPage } from "next";
import { Heading } from "components/ui";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import { getPublicSnapshot, PublicCatalogSummary } from "../lib/publicSnapshot";

const getCardProps = (node: PublicCatalogSummary) => ({
  image: node.image
    ? {
        url: node.image,
        thumbUrl: node.imageThumbUrl,
        blurUrl: node.imageBlurUrl,
      }
    : PLACEHOLDER_IMAGE_URL,
  name: node.name,
  intro: node.intro,
  numListings: node.totalCount,
  slug: node.slug,
});

const Catalogs: NextPage<{ catalogs: PublicCatalogSummary[] }> = ({
  catalogs,
}) => {
  return (
    <Layout>
      <Heading level={1}>Catalogs</Heading>
      {catalogs.length === 0 && <p>No Catalogs Available.</p>}
      {catalogs[0] && (
        <CatalogCard {...getCardProps(catalogs[0])} priority featured />
      )}
      {catalogs.length > 1 && (
        <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {catalogs.slice(1).map((node) => (
            <CatalogCard key={node.slug} {...getCardProps(node)} />
          ))}
        </div>
      )}
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
