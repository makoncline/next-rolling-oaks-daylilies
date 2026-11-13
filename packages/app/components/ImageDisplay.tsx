import React from "react";
import Image from "next/image";
import type { PublicImage } from "lib/publicSnapshot";
import {
  BlurPlaceholder,
  getDevImageRevealClassName,
  getImageUrls,
  type ImageSource,
} from "./Image";
import { cx } from "./ui";
import { NoPhoto } from "./noPhoto";

function ImageDisplay({
  images: imageSources,
  title,
}: {
  images: PublicImage[];
  title: string;
}) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageSource: ImageSource | undefined = imageSources[imageIndex];
  return (
    <div className="grid w-full grid-cols-4 gap-2 sm:gap-3">
      <div className="relative col-span-4 aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {imageSource ? <BlurPlaceholder source={imageSource} /> : <NoPhoto title={title} size="large" />}
        {imageSource && (
          <Image
            key={imageIndex}
            src={getImageUrls(imageSource).full}
            alt={`${title} Photo`}
            priority
            fill
            sizes="600px"
            className={cx("object-cover", getDevImageRevealClassName(imageSource))}
            unoptimized
          />
        )}
      </div>
      {imageSources.length > 1 &&
        imageSources.map((source, i) => {
          const thumbImages = getImageUrls(source);
          return (
            <button
              type="button"
              key={i}
              aria-label={`Show ${title} Photo ${i + 1}`}
              aria-pressed={i === imageIndex}
              className={cx(
                "relative aspect-square cursor-pointer overflow-hidden rounded-md border-0 bg-muted p-0 transition-opacity",
                i === imageIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => setImageIndex(i)}
            >
              <BlurPlaceholder source={source} />
              <Image
                src={thumbImages.thumb}
                alt=""
                aria-hidden="true"
                fill
                sizes="200px"
                className={cx("object-cover", getDevImageRevealClassName(source))}
                unoptimized
              />
            </button>
          );
        })}
    </div>
  );
}

export { ImageDisplay };
