import React from "react";
import { Icon } from "@iconify/react";
import cart from "@iconify/icons-ic/round-shopping-cart";
import { useSnackBar } from "./snackBarProvider";
import Link from "next/link";
import { ListingType } from "../pages/catalog/[catalog]";
import { useCart } from "./cart";
import { Button, Heading, Space } from "components/ui";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import Image from "next/image";
import { getImageUrls } from "./Image";
import { formatCurrency } from "../lib/format";

const LilyCard = ({
  lily,
  priority = false,
}: {
  lily: ListingType;
  priority?: boolean;
}) => {
  const { addOrUpdateProduct } = useCart();
  const addAlert = useSnackBar().addAlert;

  const imageUrl =
    lily.images?.length > 0
      ? lily.images[0].url
      : lily.ahsListing?.ahsImageUrl || PLACEHOLDER_IMAGE_URL;

  const images = getImageUrls(imageUrl);

  const cartItem = lily.price && {
    id: lily.id,
    name: lily.title,
    price: lily.price,
  };

  return (
    <article className="flex w-full max-w-[300px] flex-col gap-4">
      {imageUrl ? (
        <div className="relative aspect-square w-full">
          <Image
            src={images.full}
            alt={lily.title + " image"}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
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
        <Heading level={2}>{lily.title}</Heading>
        <p>{lily.price ? formatCurrency(lily.price) : "Display Only"}</p>
        <Space block>
          <Space block>
            <Link href={`/${lily.slug}`}>View {lily.title}</Link>
          </Space>
          {cartItem && (
            <Button
              className="iconbutton"
              aria-label={`Add ${lily.title} to Cart`}
              onClick={() => {
                addOrUpdateProduct(cartItem);
                addAlert?.(`Added ${lily.title} to Cart`);
              }}
              style={{ alignItems: "center" }}
            >
              <Icon className="icon" icon={cart} aria-hidden="true" />
            </Button>
          )}
        </Space>
      </Space>
    </article>
  );
};

export default LilyCard;
