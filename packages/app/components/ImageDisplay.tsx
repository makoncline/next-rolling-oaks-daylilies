import React from "react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE_URL } from "lib/getPlaceholderImage";
import { getImageUrls } from "./Image";

function ImageDisplay({
  imageUrls,
  title,
}: {
  imageUrls: string[];
  title: string;
}) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageUrl = imageUrls[imageIndex] || PLACEHOLDER_IMAGE_URL;
  const images = getImageUrls(imageUrl);
  return (
    <div className="grid w-full max-w-[32rem] grid-cols-4 gap-1">
      <div className="relative col-span-4 aspect-square w-full">
        {imageUrl && (
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
      {imageUrls.length > 1 &&
        imageUrls.map((url, i) => {
          const thumbImages = getImageUrls(url);
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
              />
            </button>
          );
        })}
    </div>
  );
}

export { ImageDisplay };
