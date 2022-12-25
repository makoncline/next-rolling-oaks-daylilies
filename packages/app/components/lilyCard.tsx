import React from "react";
import styled from "styled-components";
import slugify from "slugify";
import { Icon } from "@iconify/react";
import cart from "@iconify/icons-ic/round-shopping-cart";
import { useSnackBar } from "./snackBarProvider";
import Link from "next/link";
import { Listing } from "../pages/catalog/[catalog]";
import { useCart } from "./cart";
import { Button, Heading, Space, SquareImage } from "@packages/design-system";
import { Image } from "../components/Image";
import { getPlaceholderImageUrl } from "lib/getPlaceholderImage";

const LilyCard = ({ lily }: { lily: Listing }) => {
  const { addOrUpdateProduct } = useCart();
  const addAlert = useSnackBar().addAlert;
  let image =
    lily?.img_url?.reverse()[0] ??
    lily.ahs_data?.image ??
    getPlaceholderImageUrl(lily.name);

  const cartItem = lily.price && {
    id: lily.id,
    name: lily.name,
    price: lily.price as unknown as number,
  };

  return (
    <LilyCardWrapper direction="column">
      {image ? (
        <SquareImage width="100%">
          <Image src={image} alt={lily.name + "image"} />
        </SquareImage>
      ) : (
        <div style={{ height: "100%" }} />
      )}
      <Space direction="column">
        <Heading level={4}>{lily.name}</Heading>
        <p>{lily.price ? `$${lily.price}` : "display only"}</p>
        <Space block>
          <Space block>
            <Link href={`/${slugify(lily.name)}`} passHref>
              <Button as="a">View listing</Button>
            </Link>
          </Space>
          {cartItem && (
            <Button
              className="iconbutton"
              aria-label="add to cart"
              onClick={() => {
                addOrUpdateProduct(cartItem);
                addAlert && addAlert(`Added ${lily.name} to cart!`);
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
