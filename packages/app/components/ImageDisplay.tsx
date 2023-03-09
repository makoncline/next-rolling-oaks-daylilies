import React from "react";
import styled from "styled-components";
import Image from "next/legacy/image";
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
            placeholder={images.blur === images.full ? "empty" : "blur"}
            blurDataURL={images.blur}
            alt={`listing photo`}
            layout="fill"
            objectFit="cover"
            priority
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
                placeholder={
                  thumbImages.blur === thumbImages.thumb ? "empty" : "blur"
                }
                blurDataURL={thumbImages.blur}
                alt={`listing photo ${i}`}
                layout="fill"
                objectFit="cover"
                onClick={() => setImageIndex(i)}
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
