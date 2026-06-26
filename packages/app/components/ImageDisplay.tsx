import React from "react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import type { PublicImage } from "lib/publicSnapshot";
import { getBlurImageProps, getImageUrls, type ImageSource } from "./Image";

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
    <div className="grid w-full max-w-[32rem] grid-cols-4 gap-1">
      <div className="relative col-span-4 aspect-square w-full">
        {imageSource && (
          <Image
            key={imageIndex}
            src={images.full}
            alt={`${title} Photo`}
            priority
            fill
            sizes="600px"
            style={{
              objectFit: "cover",
            }}
            unoptimized
            {...getBlurImageProps(imageSource)}
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
              className={`relative aspect-square border-0 bg-transparent p-0 ${
                i === imageIndex ? "border border-ro-text" : ""
              }`}
              onClick={() => setImageIndex(i)}
            >
              <Image
                src={thumbImages.thumb}
                alt=""
                aria-hidden="true"
                fill
                sizes="200px"
                style={{
                  objectFit: "cover",
                }}
                unoptimized
                {...getBlurImageProps(source)}
              />
            </button>
          );
        })}
    </div>
  );
}

export { ImageDisplay };
