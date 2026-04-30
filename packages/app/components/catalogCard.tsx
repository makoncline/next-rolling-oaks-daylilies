import {
  Heading,
  PropertyList,
  PropertyListItem,
  Space,
} from "components/ui";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrls } from "./Image";
import { formatNumber } from "../lib/format";

export const CatalogCard = ({
  slug,
  image,
  name,
  intro,
  numListings,
  priority = false,
}: {
  slug: string;
  image: string;
  name: string;
  intro?: string | null;
  numListings: number;
  priority?: boolean;
}) => {
  const images = getImageUrls(image);
  return (
    <article className="grid w-full grid-cols-1 grid-rows-[18rem_auto] justify-items-center gap-4 hover:bg-ro-surface md:grid-cols-[18rem_1fr] md:grid-rows-[minmax(18rem,auto)]">
      <Image
        src={images.full}
        alt={`${name} catalog image`}
        width={288}
        height={288}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="h-72 w-72 object-cover"
        unoptimized
      />
      <Space block direction="column" className="items-start p-4">
        <Heading level={2}>{name}</Heading>
        <PropertyList divider>
          <PropertyListItem label="# Listings">
            {formatNumber(numListings)}
          </PropertyListItem>
        </PropertyList>
        {intro && <p>{intro}</p>}
        <Link href={`/catalog/${slug}`} passHref>
          View {name} Catalog
        </Link>
      </Space>
    </article>
  );
};
