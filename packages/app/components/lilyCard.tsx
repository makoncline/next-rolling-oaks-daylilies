import React from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useSnackBar } from "./snackBarProvider";
import Link from "next/link";
import { ListingType } from "../pages/catalog/[catalog]";
import { useCart } from "./cart";
import { Button, Heading, cx } from "components/ui";
import Image from "next/image";
import {
  BlurPlaceholder,
  getDevImageRevealClassName,
  getImageUrls,
  type ImageSource,
} from "./Image";
import { formatCurrency } from "../lib/format";
import { NoPhoto } from "./noPhoto";

const LilyCard = ({
  lily,
  priority = false,
  headingLevel = 2,
  variant = "full",
}: {
  lily: ListingType;
  priority?: boolean;
  /** Cards inside a titled section sit one level below it. */
  headingLevel?: 2 | 3;
  /**
   * Catalog grids show specs and the note for comparing plants. Featured rows
   * use "compact": photo, name, origin and price, with details one click away.
   */
  variant?: "full" | "compact";
}) => {
  const { addOrUpdateProduct, getQuantity } = useCart();
  const inCart = getQuantity(lily.id);
  const addAlert = useSnackBar().addAlert;

  const imageSource: ImageSource | null =
    lily.images?.length > 0
      ? lily.images[0]
      : lily.ahsListing?.ahsImageUrl || null;

  const cartItem = lily.price && {
    id: lily.id,
    name: lily.title,
    price: lily.price,
    image: imageSource ? getImageUrls(imageSource).thumb : null,
  };

  const ahs = lily.ahsListing;
  const origin = [ahs?.hybridizer, ahs?.year].filter(Boolean).join(", ");
  const specs = [
    ahs?.form?.split("|").join(" / "),
    ahs?.bloomSize && `${ahs.bloomSize} bloom`,
    ahs?.scapeHeight && `${ahs.scapeHeight} scape`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="group relative flex w-full min-w-0 flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-tile">
        {imageSource ? (
          <>
            <BlurPlaceholder source={imageSource} />
            <Image
              src={getImageUrls(imageSource).full}
              alt={lily.title + " image"}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
              className={cx("object-cover transition-opacity group-hover:opacity-90", getDevImageRevealClassName(imageSource))}
              unoptimized
            />
          </>
        ) : (
          <NoPhoto title={lily.title} />
        )}
      </div>
      <div className="flex grow flex-col gap-0.5">
        <Heading level={headingLevel}>
          <Link
            href={`/${lily.slug}`}
            className="block text-tile-title font-semibold leading-snug text-foreground-emphasis after:absolute after:inset-0 after:rounded-md group-hover:underline"
          >
            <span className="sr-only">View </span>
            {lily.title}
          </Link>
        </Heading>
        {origin && <p className="m-0 mt-0.5 text-meta leading-snug text-muted-foreground">{origin}</p>}
        {variant === "full" && specs && <p className="m-0 text-fine leading-snug text-subtle-foreground">{specs}</p>}
        {variant === "full" && lily.description && (
          <p className="m-0 mt-1 line-clamp-2 text-fine leading-snug text-muted-foreground">
            {lily.description}
          </p>
        )}
        <div className="mt-auto flex min-h-control-compact items-center justify-between gap-2 pt-2">
          {lily.price ? (
            <div className="flex min-w-0 flex-col">
              <span className="font-bold tabular-nums text-foreground-emphasis">
                {formatCurrency(lily.price)}
              </span>
              {inCart > 0 && <InCart quantity={inCart} />}
            </div>
          ) : (
            <span className="text-meta text-subtle-foreground">Display Only</span>
          )}
          {cartItem && (
            <div className="relative z-1">
              <Button
                size="compact"
                aria-label={`Add ${lily.title} to Cart`}
                onClick={() => {
                  addOrUpdateProduct(cartItem);
                  addAlert(`Added ${lily.title} to Cart`);
                }}
              >
                <ShoppingCart aria-hidden="true" className="shrink-0 size-3.5" />
                Add
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default LilyCard;

/** Persistent confirmation that a plant is already in the cart. */
export function InCart({ quantity }: { quantity: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-fine font-semibold text-success-text">
      <Check aria-hidden="true" className="size-3.5 shrink-0" />
      In cart: {quantity}
    </span>
  );
}
