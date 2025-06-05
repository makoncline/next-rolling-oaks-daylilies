import React from "react";
import slugify from "slugify";
import { Icon } from "@iconify/react";
import cart from "@iconify/icons-ic/round-shopping-cart";
import { useSnackBar } from "./snackBarProvider";
import Link from "next/link";
import { ListingType } from "../pages/catalog/[catalog]";
import { useCart } from "./cart";
import { Button, Heading, Space } from "@packages/design-system";
import { getPlaceholderImageUrl } from "lib/getPlaceholderImage";
import Image from "next/image";
import { getImageUrls } from "./Image";
import styled from "styled-components";

const LilyCard = ({ lily }: { lily: ListingType }) => {
  const { addOrUpdateProduct } = useCart();
  const addAlert = useSnackBar().addAlert;

  let imageUrl =
    lily.images?.length > 0
      ? lily.images[0].url
      : lily.ahsListing?.ahsImageUrl || getPlaceholderImageUrl(lily.title);

  const images = getImageUrls(imageUrl);

  const cartItem = lily.price && {
    id: lily.id,
    name: lily.title,
    price: lily.price,
  };

  return (
    <LilyCardWrapper direction="column">
      {imageUrl ? (
        <div
          css={`
            height: var(--size-image-card);
            aspect-ratio: var(--ratio-square);
            position: relative;
          `}
        >
          <Image
            src={images.full}
            alt={lily.title + " image"}
            fill
            sizes="600px"
            style={{
              objectFit: "cover",
            }}
            unoptimized
          />
        </div>
      ) : (
        <div style={{ height: "100%" }} />
      )}
      <Space direction="column">
        <Heading level={4}>{lily.title}</Heading>
        <p>{lily.price ? `$${lily.price}` : "display only"}</p>
        <Space block>
          <Space block>
            <Link href={`/${lily.slug}`}>View listing</Link>
          </Space>
          {cartItem && (
            <Button
              className="iconbutton"
              aria-label="add to cart"
              onClick={() => {
                addOrUpdateProduct(cartItem);
                addAlert && addAlert(`Added ${lily.title} to cart!`);
              }}
              style={{ alignItems: "center" }}
            >
              <Icon className="icon" icon={cart} />
            </Button>
          )}
        </Space>
      </Space>
    </LilyCardWrapper>
  );
};

export default LilyCard;

const LilyCardWrapper = styled(Space)`
  width: 100%;
  max-width: 300px;
`;
