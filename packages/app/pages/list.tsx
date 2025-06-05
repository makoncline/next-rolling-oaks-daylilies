import React from "react";
import Layout from "../components/layout";
import { GetStaticProps } from "next";
import { siteConfig } from "../siteConfig";
import { prisma } from "../prisma/db";
import { Heading, Thumbnail } from "@packages/design-system";
import { sortTitlesLettersBeforeNumbers } from "../lib/sort";
import type { InferGetStaticPropsType } from "next";
import { getImageUrls } from "components/Image";
import Image from "next/image";
import Link from "next/link";

const Listings = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
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

export const getStaticProps: GetStaticProps<{
  listings: Listing[];
}> = async () => {
  const listings = await prisma.listing.findMany({
    where: {
      userId: siteConfig.userId,
      OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
    },
    include: {
      ahsListing: { select: { hybridizer: true } },
      images: { take: 1, orderBy: { order: "asc" } },
    },
  });

  const improvedListings = listings.map((listing) => {
    const firstImage = listing.images.length > 0 ? listing.images[0].url : null;

    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      description: listing.description,
      image: firstImage,
      slug: listing.slug,
      hybridizer: listing.ahsListing?.hybridizer || null,
    };
  });

  const sortedListings = sortTitlesLettersBeforeNumbers(improvedListings);

  return {
    props: JSON.parse(
      JSON.stringify({
        listings: sortedListings,
      })
    ),
    revalidate: 60,
  };
};
