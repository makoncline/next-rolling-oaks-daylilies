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
  const introCopy = intro
    ?.replace(/Daylillies/g, "Daylilies")
    .replace(/daylillies/g, "daylilies")
    .replace(/Non registered/g, "Non-registered")
    .replace(/non registered/g, "non-registered");

  return (
    <article className="grid w-full grid-cols-1 gap-4 border-b border-ro-muted pb-6 md:grid-cols-[14rem_1fr]">
      <Image
        src={images.full}
        alt={`${name} catalog image`}
        width={288}
        height={288}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="aspect-square w-full max-w-72 justify-self-center object-cover md:max-w-56"
        unoptimized
      />
      <Space block direction="column" className="items-start">
        <Heading level={2}>{name}</Heading>
        <PropertyList divider>
          <PropertyListItem label="# Listings">
            {formatNumber(numListings)}
          </PropertyListItem>
        </PropertyList>
        {introCopy && <p>{introCopy}</p>}
        <Link href={`/catalog/${slug}`} passHref>
          View {name} Catalog
        </Link>
      </Space>
    </article>
  );
};
