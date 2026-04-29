import React from "react";
import Image from "next/image";
import { getPlaceholderImageUrl } from "lib/getPlaceholderImage";
import { getImageUrls } from "./Image";

function ImageDisplay({ imageUrls }: { imageUrls: string[] }) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageUrl = imageUrls[imageIndex] || getPlaceholderImageUrl();
  const images = getImageUrls(imageUrl);
  return (
    <div
      className="grid grid-cols-4"
      style={{
        gridTemplateRows:
          imageUrls.length > 1
            ? "min(calc(100vw - 4rem), 32rem) min(calc((100vw - 4rem) / 4), 8rem)"
            : "min(calc(100vw - 4rem), 32rem)",
      }}
    >
      <div className="relative col-span-4">
        {imageUrl && (
          <Image
            key={imageIndex}
            src={images.full}
            alt={`listing photo`}
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
      {imageUrls.length > 1 &&
        imageUrls.map((url, i) => {
          const thumbImages = getImageUrls(url);
          return (
            <div
              key={i}
              className={`relative aspect-square ${
                i === imageIndex ? "border border-ro-text" : ""
              }`}
            >
              <Image
                src={thumbImages.thumb}
                alt={`listing photo ${i}`}
                onClick={() => setImageIndex(i)}
                fill
                sizes="200px"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
          );
        })}
    </div>
  );
}

export { ImageDisplay };
