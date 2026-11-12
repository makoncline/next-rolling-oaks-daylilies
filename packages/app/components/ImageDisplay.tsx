import React from "react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import type { PublicImage } from "lib/publicSnapshot";
import {
  BlurPlaceholder,
  getDevImageRevealClassName,
  getImageUrls,
  type ImageSource,
} from "./Image";
import { cx } from "./ui";

function ImageDisplay({
  images: imageSources,
  title,
}: {
  images: PublicImage[];
  title: string;
}) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageSource: ImageSource =
    imageSources[imageIndex] || PLACEHOLDER_IMAGE_URL;
  const images = getImageUrls(imageSource);
  return (
    <div className="grid w-full max-w-128 grid-cols-4 gap-1">
      <div className="relative col-span-4 aspect-square w-full overflow-hidden">
        <BlurPlaceholder source={imageSource} />
        {imageSource && (
          <Image
            key={imageIndex}
            src={images.full}
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
              className={`relative aspect-square overflow-hidden border-0 bg-transparent p-0 ${
                i === imageIndex ? "border border-foreground" : ""
              }`}
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
