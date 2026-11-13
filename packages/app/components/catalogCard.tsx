import { Button, Heading, cx } from "components/ui";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BlurPlaceholder,
  getDevImageRevealClassName,
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
  featured = false,
}: {
  slug: string;
  image: ImageSource;
  name: string;
  intro?: string | null;
  numListings: number;
  priority?: boolean;
  featured?: boolean;
}) => {
  const images = getImageUrls(image);
  const introCopy = intro
    ?.replace(/Daylillies/g, "Daylilies")
    .replace(/daylillies/g, "daylilies")
    .replace(/Non registered/g, "Non-registered")
    .replace(/non registered/g, "non-registered");

  return (
    <article
      className={cx(
        "group relative grid w-full content-start gap-4",
        featured && "items-center rounded-lg border-stroke border-card-border bg-card p-4 sm:p-5 md:grid-cols-12 md:gap-10"
      )}
    >
      <div
        className={cx(
          "relative aspect-4/3 w-full overflow-hidden rounded-md bg-tile",
          featured && "md:col-span-5"
        )}
      >
        <BlurPlaceholder source={image} />
        <Image
          src={images.full}
          alt={`${name} catalog image`}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes={featured ? "(min-width: 768px) 480px, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"}
          className={cx("object-cover transition-opacity group-hover:opacity-90", getDevImageRevealClassName(image))}
          unoptimized
        />
      </div>
      <div
        className={cx(
          "flex min-w-0 flex-col items-start gap-2",
          featured && "md:col-span-7"
        )}
      >
        <Heading level={2}>
          <span className={cx("block", featured ? "text-heading-1" : "text-heading-4")}>
            {name}
          </span>
        </Heading>
        <p className="m-0 text-meta tabular-nums text-subtle-foreground">
          {formatNumber(numListings)}{" "}
          {numListings === 1 ? "listing" : "listings"}
        </p>
        {introCopy && (
          <p className={cx("m-0", featured ? "text-foreground" : "text-meta text-muted-foreground")}>
            {introCopy}
          </p>
        )}
        {featured ? (
          <div className="mt-2">
            <Button as="a" href={`/catalog/${slug}`} styleType="primary">
              View {name} Catalog
            </Button>
          </div>
        ) : (
          <Link
            href={`/catalog/${slug}`}
            className="mt-1 text-meta font-semibold text-foreground-emphasis after:absolute after:inset-0 after:rounded-md group-hover:underline"
          >
            View {name} Catalog
          </Link>
        )}
      </div>
    </article>
  );
};
