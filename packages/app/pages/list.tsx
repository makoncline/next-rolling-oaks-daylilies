import React from "react";
import slugify from "slugify";
import Layout from "../components/layout";
import { GetStaticProps } from "next";
import { siteConfig } from "../siteConfig";
import { prisma } from "../prisma/db";
import { Heading, Thumbnail } from "@packages/design-system";
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
            const images = listing.image ? getImageUrls(listing.image) : null;
            return (
              <tr key={listing.id}>
                {/* <td>
                  {images && (
                    <Thumbnail>
                      <Image
                        src={images.thumb}
                        alt={`${listing.name}`}
                        fill
                        sizes="200px"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    </Thumbnail>
                  )}
                </td> */}
                <td>{listing.name}</td>
                <td>{listing.hybridizer}</td>
                <td>{listing.price ? `$${listing.price}` : "display only"}</td>
                <td>{listing.public_note}</td>
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
  id: number;
  name: string;
  price: number | null;
  public_note: string | null;
  hybridizer: string | null;
};

export const getStaticProps: GetStaticProps<{
  listings: Listing[];
}> = async () => {
  const listings = await prisma.lilies.findMany({
    where: { user_id: siteConfig.userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      public_note: true,
      img_url: true,
      ahs_data: { select: { image: true, hybridizer: true } },
    },
  });
  const improvedListings = listings.map((listing) => {
    const { img_url, ahs_data, ...rest } = listing;
    const listingImages = [...img_url, ahs_data?.image].filter(
      Boolean
    ) as string[];
    const firstImage = listingImages.length > 0 ? listingImages[0] : null;
    const slug = slugify(listing.name, { lower: true });
    return {
      ...rest,
      image: firstImage,
      slug,
      hybridizer: ahs_data?.hybridizer,
    };
  });
  return {
    props: JSON.parse(
      JSON.stringify({
        listings: improvedListings,
      })
    ),
  };
};
