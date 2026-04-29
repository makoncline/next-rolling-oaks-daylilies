import React from "react";
import Layout from "../components/layout";
import { GetServerSideProps } from "next";
import { siteConfig } from "../siteConfig";
import { prisma } from "../prisma/db";
import { Heading } from "@packages/design-system";
import { sortTitlesLettersBeforeNumbers } from "../lib/sort";
import type { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import {
  hybridizerCultivarReferenceInclude,
  mapListingCultivarDisplay,
} from "../lib/cultivarDisplay";

const Listings = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { listings } = props;
  return (
    <Layout>
      <Heading level={1}>All Daylily Listings</Heading>
      <table
        css={`
          table-layout: fixed;
          border-collapse: collapse;
          width: 100%;
          overflow: hidden;
          th {
            text-align: left;
          }
          td {
            border-bottom: var(--border-size-1) solid white;
          }
        `}
      >
        <thead>
          <tr>
            {/* <th>Image</th> */}
            <th>Name</th>
            <th>Hybridizer</th>
            <th>Price</th>
            <th>Description</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => {
            return (
              <tr key={listing.id}>
                {/* <td>
                  {listing.image && (
                    <Thumbnail>
                      <Image
                        src={listing.image}
                        alt={`${listing.title}`}
                        fill
                        sizes="200px"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    </Thumbnail>
                  )}
                </td> */}
                <td>{listing.title}</td>
                <td>{listing.hybridizer}</td>
                <td>{listing.price ? `$${listing.price}` : "display only"}</td>
                <td>{listing.description}</td>
                <td>
                  <Link href={`/${listing.slug}`}>View</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
};

export default Listings;

type Listing = {
  image: string | null;
  slug: string;
  id: string;
  title: string;
  price: number | null;
  description: string | null;
  hybridizer: string | null;
};

export const getServerSideProps: GetServerSideProps<{
  listings: Listing[];
}> = async () => {
  const listings = await prisma.listing.findMany({
    where: {
      userId: siteConfig.userId,
      OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
    },
    include: {
      cultivarReference: {
        include: hybridizerCultivarReferenceInclude,
      },
      images: { take: 1, orderBy: { order: "asc" } },
    },
  });

  const improvedListings = listings.map((listing) => {
    const displayListing = mapListingCultivarDisplay(listing);
    const firstImage =
      displayListing.images.length > 0 ? displayListing.images[0].url : null;

    return {
      id: displayListing.id,
      title: displayListing.title,
      price: displayListing.price,
      description: displayListing.description,
      image: firstImage,
      slug: displayListing.slug,
      hybridizer: displayListing.ahsListing?.hybridizer ?? null,
    };
  });

  const sortedListings = sortTitlesLettersBeforeNumbers(improvedListings);

  return {
    props: JSON.parse(
      JSON.stringify({
        listings: sortedListings,
      })
    ),
  };
};
