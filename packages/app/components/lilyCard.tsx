import React, { useContext } from "react";
import styled from "styled-components";
import slugify from "slugify";
import { Icon } from "@iconify/react";
import cart from "@iconify/icons-ic/round-shopping-cart";
import { useSnackBar } from "./snackBarProvider";
import Link from "next/link";
import { Listing } from "../pages/catalog/[catalog]";
import { useCart } from "./cart";
import { SquareImage } from "../../design-system/src";
import { Image } from "../components/Image";

const LilyCard = ({ lily }: { lily: Listing }) => {
  const { addOrUpdateProduct, addOne } = useCart();
  const addAlert = useSnackBar().addAlert;
  let image = lily.img_url.find(Boolean);
  if (!image && lily?.img_url && lily?.img_url.length > 0) {
    image = lily.img_url.reverse()[0];
  }
  if (!image && lily.ahs_data?.image) {
    image = lily.ahs_data?.image;
  }
  const cartItem = lily.price && {
    id: lily.id,
    name: lily.name,
    price: lily.price as unknown as number,
  };

  return (
    <Style image={image || null}>
      <div className="container">
        <div style={{ position: "relative", width: 250, height: 250 }}>
          {image ? (
            <SquareImage>
              <Image src={image} alt={lily.name + "image"} />
            </SquareImage>
          ) : (
            <div className="image" />
          )}
        </div>
        <div className="text">
          <h3>{lily.name}</h3>
          <p className="text--low">
            {lily.price ? `$${lily.price}` : "display only"}
          </p>
          <div className="bot">
            <Link href={`/${slugify(lily.name, { lower: true })}`}>
              View details
            </Link>
            {cartItem && (
              <button
                className="iconbutton"
                aria-label="add to cart"
                onClick={() => {
                  addOrUpdateProduct(cartItem);
                  addAlert && addAlert(`Added ${lily.name} to cart!`);
                }}
              >
                <Icon className="icon" icon={cart} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Style>
  );
};

export default LilyCard;

const Style = styled.div<{ image: string | null }>`
  icon {
    color: rgb(var(--rgb-blue));
  }
  width: 250px;
  display: flex;
  justify-content: flex-start;
  align-items: space-between;
  &:hover {
    background-color: var(--bg-shine);
  }
  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .image {
    width: 250px;
    height: 250px;
    background: var(--bg-2);
  }
  .text {
    margin: 0 1rem 1rem 1rem;
  }
  .iconbutton {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    border-radius: 3rem;
    font-size: 1.5rem;

    height: 40px;
    color: rgb(var(--rgb-blue));
    transition: transform 0.3s, color 1s;
    &:hover {
      background-color: var(--bg-shine);
    }
    &:focus {
      outline: none;
    }
    &:active {
      outline: none;
      color: rgb(var(--rgb-green));
      transition: none;
    }
    .icon {
      height: 40px;
    }
  }
  .bot {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;
