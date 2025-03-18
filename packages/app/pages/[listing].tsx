import React from "react";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import Head from "next/head";
import cart from "@iconify/icons-ic/round-shopping-cart";
import Layout from "../components/layout";
import { DaylilyCatalogAd } from "../components/DaylilyCatAd";
import { useSnackBar } from "components/snackBarProvider";
import { AhsListing, Listing, Image } from "../prisma/generated/sqlite-client";
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

const traitLabels: Partial<Record<keyof AhsListing, string>> = {
  hybridizer: "Hybridizer",
  year: "Year",
  parentage: "Parentage",
  ploidy: "Ploidy",
  scapeHeight: "Scape height",
  color: "Color",
  bloomHabit: "Bloom habit",
  bloomSeason: "Bloom season",
  bloomSize: "Bloom size",
  branches: "Branches",
  budcount: "Bud count",
  flower: "Flower",
  foliage: "Foliage",
  foliageType: "Foliage type",
  form: "Form",
  fragrance: "Fragrance",
  sculpting: "Sculpting",
  seedlingNum: "Seedling #",
};

const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

function objectKeys<T extends {}>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

type DisplayListing = Listing & {
  ahsListing: AhsListing | null;
  images: Image[];
  lists?: {
    title: string;
  } | null;
};

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
    (listing.description ? `Description: ${listing.description.trim()}` : "") +
    (listing.price ? `, Price: ${listing.price}` : ", Price: Display only") +
    objectKeys(traitLabels)
      .map((trait) => {
        if (listing.ahsListing && getKeyValue(listing.ahsListing, trait)) {
          return `${getKeyValue(traitLabels, trait)}: ${getKeyValue(
            listing.ahsListing,
            trait
          )}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(", ")
  }, Updated: ${formatDistanceToNow(new Date(listing.updatedAt), {
    addSuffix: true,
  })}`.substring(0, 160);
  const { asPath } = useRouter();
  const title = `${listing.title} Daylily`;
  const {
    title: name,
    price,
    description: publicNote,
    updatedAt,
    ahsListing: ahsData,
    images,
    lists,
  } = listing;
  const listName = lists?.title;
  const cartItem = listing.price && {
    id: listing.id,
    name: listing.title,
    price: listing.price,
  };
  const { addOrUpdateProduct } = useCart();
  const addAlert = useSnackBar().addAlert;
  const image = images.length > 0 ? images[0].url : "";
  const imageUrls = images.map((img) => img.url);

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
        <ImageDisplay imageUrls={imageUrls} />
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
                  addAlert(`Added ${listing.title} to cart!`);
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

function getTraits(ahsData: AhsListing) {
  return objectKeys(traitLabels)
    .map((key) => (ahsData[key] ? [traitLabels[key], ahsData[key]] : null))
    .filter(Boolean) as [string, string][];
}

export async function getStaticPaths() {
  const listings = await prisma.listing.findMany({
    where: {
      userId: siteConfig.userId,
    },
    select: { title: true, slug: true },
  });

  return {
    paths: listings.map((listing) => ({
      params: { listing: listing.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const slug = context.params.listing;

  const listing = await prisma.listing.findFirst({
    where: {
      userId: siteConfig.userId,
      slug,
    },
    include: {
      ahsListing: true,
      images: {
        orderBy: { order: "asc" },
      },
      lists: {
        select: { title: true },
      },
    },
  });

  if (!listing) {
    return {
      notFound: true,
    };
  }

  // Find previous and next listing for navigation
  const allListings = await prisma.listing.findMany({
    where: { userId: siteConfig.userId },
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });

  const currentIndex = allListings.findIndex((l) => l.slug === slug);
  const prevListing =
    currentIndex > 0 ? allListings[currentIndex - 1].slug : null;
  const nextListing =
    currentIndex < allListings.length - 1
      ? allListings[currentIndex + 1].slug
      : null;

  return {
    props: {
      listing: JSON.parse(JSON.stringify(listing)),
      previous: prevListing || "",
      next: nextListing || "",
    },
    revalidate: 60,
  };
}
