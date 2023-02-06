import React from "react";
import styled from "styled-components";
import Image from "next/image";
import { getPlaceholderImageUrl } from "lib/getPlaceholderImage";

function ImageDisplay({ imageUrls }: { imageUrls: string[] }) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageUrl = imageUrls[imageIndex] || getPlaceholderImageUrl();
  return (
    <Wrapper hasMultipleImages={imageUrls.length > 1}>
      <DisplayImage>
        {imageUrl && (
          <Image
            key={imageIndex}
            src={imageUrl}
            alt={`listing photo`}
            layout="fill"
            objectFit="cover"
            priority
          />
        )}
      </DisplayImage>
      {imageUrls.length > 1 &&
        imageUrls.map((url, i) => (
          <Thumbnail key={i} selected={i === imageIndex}>
            <Image
              src={url}
              alt={`listing photo ${i}`}
              layout="fill"
              objectFit="cover"
              onClick={() => setImageIndex(i)}
            />
          </Thumbnail>
        ))}
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
