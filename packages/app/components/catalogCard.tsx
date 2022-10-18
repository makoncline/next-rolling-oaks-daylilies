import {
  above,
  Button,
  Heading,
  PropertyList,
  PropertyListItem,
  Space,
  SquareImage,
} from "@packages/design-system";
import React from "react";
import styled from "styled-components";
import Link from "next/link";

import { Image } from "./Image";

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
  return (
    <StyledCard>
      <SquareImage width="var(--size-image-card)">
        <Image src={image} alt={`${name} catalog image`} />
      </SquareImage>
      <Body block direction="column">
        <Heading level={3}>{name}</Heading>
        <PropertyList divider>
          <PropertyListItem label="# Listings">
            {numListings.toLocaleString()}
          </PropertyListItem>
        </PropertyList>
        {intro && <p>{intro}</p>}
        <Link href={`/catalog/${slug}`} passHref>
          <Button as="a">View Catalog</Button>
        </Link>
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
    grid-template-rows: var(--size-image-card);
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
