import {
  above,
  Heading,
  PropertyList,
  PropertyListItem,
  Space,
} from "@packages/design-system";
import React from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { getImageUrls } from "./Image";

export const CatalogCard = ({
  slug,
  image,
  name,
  intro,
  numListings,
}: {
  slug: string;
  image: string;
  name: string;
  intro?: string | null;
  numListings: number;
}) => {
  const images = getImageUrls(image);
  console.log(images);
  return (
    <StyledCard>
      <div
        css={`
          width: var(--size-image-card);
          aspect-ratio: var(--ratio-square);
          position: relative;
        `}
      >
        <Image
          src={images.full}
          placeholder={images.blur === images.full ? "empty" : "blur"}
          blurDataURL={images.blur}
          alt={`${name} catalog image`}
          fill
          css={`
            object-fit: cover;
          `}
          sizes="600px"
          unoptimized
        />
      </div>
      <Body block direction="column">
        <Heading level={3}>{name}</Heading>
        <PropertyList divider>
          <PropertyListItem label="# Listings">
            {numListings.toLocaleString()}
          </PropertyListItem>
        </PropertyList>
        {intro && <p>{intro}</p>}
        <Link href={`/catalog/${slug}`}>View Catalog</Link>
      </Body>
    </StyledCard>
  );
};

const StyledCard = styled.article`
  width: 100%;
  display: grid;
  gap: var(--size-4);
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-image-card) auto;
  justify-items: center;
  ${above.sm`
    grid-template-columns: var(--size-image-card) 1fr;
    grid-template-rows: minmax(var(--size-image-card), auto);
    width: 100%;
  `}
  :hover {
    background: var(--surface-2);
  }
`;

const Body = styled(Space)`
  padding: var(--size-4);
  align-items: flex-start;
`;
