import React from "react";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import Head from "next/head";
import cart from "@iconify/icons-ic/round-shopping-cart";
import Layout from "../components/layout";
import { DaylilyCatalogAd } from "../components/DaylilyCatAd";
import { useSnackBar } from "components/snackBarProvider";
import { ahs_data, lilies } from "@prisma/client";
import { useCart } from "components/cart";
import { siteConfig } from "siteConfig";
import slugify from "slugify";
import { prisma } from "../prisma/db";
import { ImageDisplay } from "components/ImageDisplay";
import {
  Badge,
  Button,
  FancyHeading,
  Heading,
  Hr,
  PropertyList,
  PropertyListItem,
  Space,
} from "@packages/design-system";
import { useRouter } from "next/router";

const traitLabels: Partial<Record<keyof ahs_data, string>> = {
  hybridizer: "Hybridizer",
  year: "Year",
  parentage: "Parentage",
  ploidy: "Ploidy",
  scape_height: "Scape height",
  color: "Color",
  bloom_habit: "Bloom habit",
  bloom_season: "Bloom season",
  bloom_size: "Bloom size",
  branches: "Branches",
  budcount: "Bud count",
  flower: "Flower",
  foliage: "Foliage",
  foliage_type: "Foliage type",
  form: "Form",
  fragrance: "Fragrance",
  sculpting: "Sculpting",
  seedling_num: "Seedling #",
};

const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

function objectKeys<T extends {}>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

const LilyTemplate = ({
  listing,
  previous,
  next,
}: {
  listing: DisplayListing;
  previous: string;
  next: string;
}) => {
  const description = `${
    (listing.public_note ? `Description: ${listing.public_note.trim()}` : "") +
    (listing.price ? `, Price: ${listing.price}` : ", Price: Display only") +
    objectKeys(traitLabels)
      .map((trait) => {
        if (listing.ahs_data && getKeyValue(listing.ahs_data, trait)) {
          return `${getKeyValue(traitLabels, trait)}: ${getKeyValue(
            listing.ahs_data,
            trait
          )}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(", ")
  }, Updated: ${formatDistanceToNow(new Date(listing.updated_at), {
    addSuffix: true,
  })}`.substring(0, 160);
  const { asPath } = useRouter();
  const title = `${listing.name} Daylily`;
  const {
    name,
    price,
    public_note: publicNote,
    updated_at: updatedAt,
    ahs_data: ahsData,
    img_url: images,
    lists,
  } = listing;
  const listName = lists?.name;
  const cartItem = listing.price && {
    id: listing.id,
    name: listing.name,
    price: listing.price as unknown as number,
  };
  const { addOrUpdateProduct } = useCart();
  const addAlert = useSnackBar().addAlert;
  const image = images.length > 0 ? images[0] : "";

  return (
    <Layout>
      <Head>
        <title key="title">{title}</title>
        <meta property="og:title" content={title} key="og:title" />
        <meta
          name="description"
          content={description.substring(0, 160)}
          key="description"
        />
        <meta
          property="og:description"
          content={description.substring(0, 160)}
          key="og:description"
        />
        <meta property="og:type" content="article" key="og:type" />
        <meta property="og:image" content={image} key="og:image" />
        <meta
          name="og:image:alt"
          content={`${title} image`}
          key="og:image:alt"
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
          key="twitter:card"
        />
        <meta
          name="twitter:image:alt"
          content={`${title} image`}
          key="twitter:image:alt"
        />
      </Head>
      <FancyHeading level={1}>{name}</FancyHeading>
      <Space center responsive gap="medium">
        <ImageDisplay imageUrls={images} />
        <Space
          direction="column"
          style={{ overflowX: "hidden", width: "100%" }}
        >
          <PropertyList divider>
            {price && (
              <PropertyListItem label="Price">{`$${price}`}</PropertyListItem>
            )}
            {updatedAt && (
              <PropertyListItem label="Updated">
                {new Date(updatedAt).toLocaleDateString("en-US", {
                  year: "2-digit",
                  month: "short",
                  day: "numeric",
                })}
              </PropertyListItem>
            )}
            {listName && (
              <PropertyListItem label="List">
                <Badge>{listName}</Badge>
              </PropertyListItem>
            )}
          </PropertyList>
          <PropertyList column>
            {publicNote && (
              <PropertyListItem label="Description">
                {publicNote}
              </PropertyListItem>
            )}
          </PropertyList>
          {cartItem && (
            <div>
              <Button
                aria-label="add to cart"
                onClick={() => {
                  addOrUpdateProduct(cartItem);
                  addAlert(`Added ${listing.name} to cart!`);
                }}
              >
                <Space>
                  Add to cart
                  <Icon className="icon" icon={cart} />
                </Space>
              </Button>
            </div>
          )}
          {ahsData && (
            <div>
              <Heading level={3}>Details</Heading>
              <Hr />
              <PropertyList column padding="var(--size-1)">
                {getTraits(ahsData).map(([key, value]) => (
                  <PropertyListItem inline label={key} key={key}>
                    {value}
                  </PropertyListItem>
                ))}
              </PropertyList>
            </div>
          )}
        </Space>
      </Space>
      <DaylilyCatalogAd />
    </Layout>
  );
};

export default LilyTemplate;

function getTraits(ahsData: ahs_data) {
  const traitLabels: Partial<Record<keyof ahs_data, string>> = {
    hybridizer: "Hybridizer",
    year: "Year",
    parentage: "Parentage",
    ploidy: "Ploidy",
    scape_height: "Scape height",
    color: "Color",
    bloom_habit: "Bloom habit",
    bloom_season: "Bloom season",
    bloom_size: "Bloom size",
    branches: "Branches",
    budcount: "Bud count",
    flower: "Flower",
    foliage: "Foliage",
    foliage_type: "Foliage type",
    form: "Form",
    fragrance: "Fragrance",
    sculpting: "Sculpting",
    seedling_num: "Seedling #",
  };
  return objectKeys(traitLabels)
    .map((key) => (ahsData[key] ? [traitLabels[key], ahsData[key]] : null))
    .filter(Boolean) as [string, string][];
}

export async function getStaticPaths() {
  const listings = await prisma.lilies.findMany({
    where: { user_id: siteConfig.userId },
    orderBy: { name: "desc" },
    select: { name: true },
  });
  const listingNames = listings
    .map((listing) => listing.name)
    .reduce((result, element) => {
      if (
        result.every(
          (otherElement) => otherElement.toLowerCase() !== element.toLowerCase()
        )
      ) {
        result.push(element);
      }
      return result;
    }, [] as string[]);

  const paths = listingNames.map((listingName) => ({
    params: {
      listing: slugify(listingName, { lower: true }),
    },
  }));
  return {
    paths: paths,
    fallback: false,
  };
}

type DisplayListing = lilies & {
  ahs_data: ahs_data | null;
  lists: {
    name: string;
  } | null;
};

export async function getStaticProps(context: any) {
  const listingSlug = context.params.listing;
  const listingIdsAndNames = await prisma.lilies.findMany({
    where: { user_id: siteConfig.userId },
    orderBy: { name: "desc" },
    select: { id: true, name: true },
  });
  const listingId = listingIdsAndNames.find(
    (node) => slugify(node.name, { lower: true }) === listingSlug
  )?.id;
  const listing = await prisma.lilies.findFirstOrThrow({
    where: { id: listingId },
    include: { ahs_data: true, lists: { select: { name: true } } },
  });
  const listingIndex = listingIdsAndNames.findIndex(
    (l) => l.name === listing.name
  );
  const previous = listingIdsAndNames[listingIndex - 1]?.name;
  const next = listingIdsAndNames[listingIndex + 1]?.name;
  const listingImages = [...listing.img_url, listing.ahs_data?.image].filter(
    Boolean
  ) as string[];
  return {
    props: JSON.parse(
      JSON.stringify({
        listing: { ...listing, img_url: listingImages },
        previous,
        next,
      })
    ),
  };
}
