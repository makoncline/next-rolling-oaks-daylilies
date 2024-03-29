import React from "react";
import styled from "styled-components";
import Image from "next/image";
import { getPlaceholderImageUrl } from "lib/getPlaceholderImage";
import { getImageUrls } from "./Image";

function ImageDisplay({ imageUrls }: { imageUrls: string[] }) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageUrl = imageUrls[imageIndex] || getPlaceholderImageUrl();
  const images = getImageUrls(imageUrl);
  return (
    <Wrapper hasMultipleImages={imageUrls.length > 1}>
      <DisplayImage>
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
      </DisplayImage>
      {imageUrls.length > 1 &&
        imageUrls.map((url, i) => {
          const thumbImages = getImageUrls(url);
          return (
            <Thumbnail key={i} selected={i === imageIndex}>
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
            </Thumbnail>
          );
        })}
    </Wrapper>
  );
}

export { ImageDisplay };

const Wrapper = styled.div<{ hasMultipleImages: boolean }>`
  display: grid;

  grid-template-rows: min(var(--full-width), var(--size-image)) ${({
      hasMultipleImages,
    }) =>
      hasMultipleImages
        ? "min(calc(var(--full-width) / 4), var(--size-image-thumbnail))"
        : ""};

  grid-template-columns: repeat(
    4,
    min(calc(var(--full-width) / 4), var(--size-image-thumbnail))
  );
`;
const DisplayImage = styled.div`
  position: relative;
  grid-column: span 4;
`;
const Thumbnail = styled.div<{ selected: boolean }>`
  position: relative;
  ${({ selected }) => (selected ? `border: var(--hairline);` : "")}
`;
