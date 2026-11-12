import React from "react";
import { Icon } from "@iconify/react";
import cart from "@iconify/icons-ic/round-shopping-cart";
import { useSnackBar } from "./snackBarProvider";
import Link from "next/link";
import { ListingType } from "../pages/catalog/[catalog]";
import { useCart } from "./cart";
import { Button, Heading, Space, cx } from "components/ui";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import Image from "next/image";
import {
  BlurPlaceholder,
  getDevImageRevealClassName,
  getImageUrls,
  type ImageSource,
} from "./Image";
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

  const imageSource: ImageSource =
    lily.images?.length > 0
      ? lily.images[0]
      : lily.ahsListing?.ahsImageUrl || PLACEHOLDER_IMAGE_URL;

  const images = getImageUrls(imageSource);

  const cartItem = lily.price && {
    id: lily.id,
    name: lily.title,
    price: lily.price,
  };

  return (
    <article className="flex w-full max-w-75 flex-col gap-4">
      {imageSource ? (
        <div className="relative aspect-square w-full overflow-hidden">
          <BlurPlaceholder source={imageSource} />
          <Image
            src={images.full}
            alt={lily.title + " image"}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="600px"
            className={cx("object-cover", getDevImageRevealClassName(imageSource))}
            unoptimized
          />
        </div>
      ) : (
        <div className="h-full" />
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
              aria-label={`Add ${lily.title} to Cart`}
              onClick={() => {
                addOrUpdateProduct(cartItem);
                addAlert(`Added ${lily.title} to Cart`);
              }}
            >
              <Icon icon={cart} aria-hidden="true" />
            </Button>
          )}
        </Space>
      </Space>
    </article>
  );
};

export default LilyCard;
