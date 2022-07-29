import React from "react";
import styled from "styled-components";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import Head from "next/head";
import cart from "@iconify/icons-ic/round-shopping-cart";
import ImgCarousel from "../components/imgCarousel";
import Container from "../components/container";
import Layout from "../components/layout";
import { DaylilyCatAd } from "../components/DaylilyCatAd";
import { useSnackBar } from "components/snackBarProvider";
import { ahs_data, lilies } from "@prisma/client";
import { useCart } from "components/cart";
import { siteConfig } from "siteConfig";
import CompHead from "../components/head";
import slugify from "slugify";
import { prisma } from "../prisma/db";

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

enum ahsProps {
  hybridizer = "hybridizer",
  year = "year",
  parentage = "parentage",
  color = "color",
  ploidy = "ploidy",
  bloomSeason = "bloomSeason",
  bloomHabit = "bloomHabit",
  budcount = "budcount",
  branches = "branches",
  bloomSize = "bloomSize",
  scapeHeight = "scapeHeight",
  foliageType = "foliageType",
  seedlingNum = "seedlingNum",
  fragrance = "fragrance",
  form = "form",
  foliage = "foliage",
  flower = "flower",
  sculpting = "sculpting",
}

const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

const Lily = ({ listing }: { listing: DisplayListing }) => {
  const cartItem = listing.price && {
    id: listing.id,
    name: listing.name,
    price: listing.price as unknown as number,
  };
  const { addOrUpdateProduct } = useCart();
  const addAlert = useSnackBar().addAlert;
  let images = listing.img_url;
  if (images.length < 1 && listing.ahs_data?.image) {
    images = [listing.ahs_data.image];
  }

  return (
    <Style>
      <div className="content">
        <div className="left">
          {images && images.length > 0 && (
            <div className="img">
              <ImgCarousel images={images} />
            </div>
          )}
          {cartItem && (
            <button
              type="button"
              aria-label="add to cart"
              className="cart"
              onClick={() => {
                addOrUpdateProduct(cartItem);
                addAlert(`Added ${listing.name} to cart!`);
              }}
            >
              <Icon className="icon" icon={cart} />
            </button>
          )}
        </div>
        <div className="right">
          {listing.private_note && (
            <p>
              Note:
              <br /> {listing.public_note}
            </p>
          )}
          <table>
            <tbody>
              {listing.ahs_data &&
                objectKeys(traitLabels).map((trait) => {
                  if (
                    listing.ahs_data &&
                    getKeyValue(listing.ahs_data, trait)
                  ) {
                    return (
                      <tr key={trait}>
                        <td className="label">
                          {getKeyValue(traitLabels, trait)} :
                        </td>
                        <td className="value">
                          {`${getKeyValue(listing.ahs_data, trait)}`}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
            </tbody>
          </table>
        </div>
      </div>
    </Style>
  );
};

function objectKeys<Obj>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj) as (keyof Obj)[];
}

const Footer = () => <Bottom></Bottom>;

const Bottom = styled.div`
  padding: 1rem;
  background-color: var(--bg-3);
  border-radius: 0 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  button {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: 1px solid rgb(var(--rgb-blue));
    outline: none;
    color: rgb(var(--rgb-blue));
    border-radius: 3rem;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
    span {
      margin-left: 0.5rem;
    }
    &:hover {
      background-color: var(--bg-shine);
    }
    &:focus {
      outline: none;
    }
    &:active {
      outline: none;
    }
  }
`;

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
  })}`;
  const images = [...listing.img_url, listing.ahs_data?.image].filter(
    Boolean
  ) as string[];
  const image = images.length > 0 ? images[0] : "";
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = `${listing.name} Daylily`;
  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={image} />
        <meta name="og:image:alt" content={`${title} image`} />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image:alt" content={`${title} image`} />
      </Head>
      <Style>
        <Container
          head={<CompHead title={listing.name} />}
          content={<Lily listing={listing} />}
          foot={<Footer />}
        />
        <DaylilyCatAd />
      </Style>
    </Layout>
  );
};

export default LilyTemplate;

const Style = styled.div`
  .cart {
    display: block;
    margin: auto;
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    border-radius: 3rem;
    font-size: 1.5rem;

    height: 40px;
    color: rgb(var(--rgb-blue));
    transition: transform 0.3s, color 1s;
    &:hover {
      background-color: var(--bg-shine);
    }
    &:focus {
      outline: none;
    }
    &:active {
      outline: none;
      color: rgb(var(--rgb-green));
      transition: none;
    }
    .icon {
      display: block;
      margin: auto;
    }
  }
  .content {
    padding: 0;
    background-color: var(--bg-4);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    table {
      border-collapse: collapse;
      td {
        vertical-align: top;
        padding: 0.2rem 0 0.2rem 0;
      }
      tr:nth-child(even) {
        background-color: var(--bg-2);
      }
      .label {
        text-align: right;
        width: 7rem;
      }
      .value {
        padding-left: 1rem;
      }
    }
    .img {
      width: 100%;
      min-width: 250px;
      max-width: 400px;
      margin: 1rem;
      display: block;
      margin: auto;
    }
    @media (max-width: 768px) {
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }
  }
  .left {
    flex: 1;
    width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .right {
    flex: 1;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
`;

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
      listing: slugify(listingName),
    },
  }));
  return {
    paths: paths,
    fallback: false,
  };
}

type DisplayListing = lilies & {
  ahs_data: ahs_data | null;
};

export async function getStaticProps(context: any) {
  const listingSlug = context.params.listing;
  const listingIdsAndNames = await prisma.lilies.findMany({
    where: { user_id: siteConfig.userId },
    orderBy: { name: "desc" },
    select: { id: true, name: true },
  });
  const listingId = listingIdsAndNames.find(
    (node) => slugify(node.name) === listingSlug
  )?.id;
  const listing = await prisma.lilies.findFirstOrThrow({
    where: { id: listingId },
    include: { ahs_data: true },
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
