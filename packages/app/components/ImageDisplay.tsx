import React from "react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import type { PublicImage } from "lib/publicSnapshot";
import {
  getBlurPlaceholderStyle,
  getImageUrls,
  type ImageSource,
} from "./Image";

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
  const blurStyle = getBlurPlaceholderStyle(imageSource);
  return (
    <div className="grid w-full max-w-[32rem] grid-cols-4 gap-1">
      <div className="relative col-span-4 aspect-square w-full overflow-hidden">
        {blurStyle && (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-110 blur-lg"
            style={blurStyle}
          />
        )}
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
          />
        )}
      </div>
      {imageSources.length > 1 &&
        imageSources.map((source, i) => {
          const thumbImages = getImageUrls(source);
          const thumbBlurStyle = getBlurPlaceholderStyle(source);
          return (
            <button
              type="button"
              key={i}
              aria-label={`Show ${title} Photo ${i + 1}`}
              className={`relative aspect-square overflow-hidden border-0 bg-transparent p-0 ${
                i === imageIndex ? "border border-ro-text" : ""
              }`}
              onClick={() => setImageIndex(i)}
            >
              {thumbBlurStyle && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 scale-110 blur-lg"
                  style={thumbBlurStyle}
                />
              )}
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
              />
            </button>
          );
        })}
    </div>
  );
}

export { ImageDisplay };
