import {
  Heading,
  PropertyList,
  PropertyListItem,
  Space,
} from "components/ui";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getBlurPlaceholderStyle,
  getImageUrls,
  type ImageSource,
} from "./Image";
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
  image: ImageSource;
  name: string;
  intro?: string | null;
  numListings: number;
  priority?: boolean;
}) => {
  const images = getImageUrls(image);
  const blurStyle = getBlurPlaceholderStyle(image);
  const introCopy = intro
    ?.replace(/Daylillies/g, "Daylilies")
    .replace(/daylillies/g, "daylilies")
    .replace(/Non registered/g, "Non-registered")
    .replace(/non registered/g, "non-registered");

  return (
    <article className="grid w-full grid-cols-1 gap-4 border-b border-ro-muted pb-6 md:grid-cols-[14rem_1fr]">
      <div className="relative aspect-square w-full max-w-72 justify-self-center overflow-hidden md:max-w-56">
        {blurStyle && (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-110 blur-lg"
            style={blurStyle}
          />
        )}
        <Image
          src={images.thumb}
          alt={`${name} catalog image`}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="288px"
          className="object-cover"
          unoptimized
        />
      </div>
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
