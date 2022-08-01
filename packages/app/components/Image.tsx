import type { ImageProps } from "next/image";
import { default as NextImage } from "next/image";
import React from "react";
import styled from "styled-components";

const S3_BUCKET_HOST_NAMES = [
  "daylily-catalog-images-stage.s3.amazonaws.com",
  "daylily-catalog-images.s3.amazonaws.com",
];

function Image({
  src: originalSrc,
  thumb = false,
  ...props
}: ImageProps & {
  thumb?: boolean;
}) {
  let hostname = "";
  let pathname = "";
  let isPlaceholder = false;
  if (typeof originalSrc === "string") {
    try {
      isPlaceholder = originalSrc.includes("boringavatars");
      const url = new URL(originalSrc);
      hostname = url.hostname;
      pathname = url.pathname;
    } catch {
      // continue
    }
  }
  const filePathNoExt =
    pathname.substring(0, pathname.lastIndexOf(".")) || pathname;
  const base = `https://${process.env.NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET}${filePathNoExt}`;
  const ext = `.webp`;
  const srcs = {
    placeholder: `${base}-placeholder${ext}`,
    thumb: `${base}-thumb${ext}`,
    full: `${base}${ext}`,
  };
  const resizedImage = thumb ? srcs.thumb : srcs.full;
  const shouldUseResizedImage = S3_BUCKET_HOST_NAMES.includes(hostname);
  const [src, setSrc] = React.useState(
    shouldUseResizedImage ? resizedImage : originalSrc
  );
  const [placeholder, setPlaceholder] = React.useState<string | null>(
    shouldUseResizedImage ? srcs.placeholder : null
  );
  const [shouldOptimize, setShouldOptimize] = React.useState(
    shouldUseResizedImage
  );

  function handleError() {
    if (src !== originalSrc) {
      console.log(
        `Error loading resized image, falling back to original. ${src}`
      );
      setSrc(originalSrc);
      setPlaceholder(null);
      setShouldOptimize(false);
    }
  }

  return (
    <Wrapper isPlaceholder={isPlaceholder}>
      <NextImage
        src={src}
        placeholder={placeholder ? "blur" : undefined}
        blurDataURL={placeholder ? placeholder : undefined}
        onError={handleError}
        quality={100}
        unoptimized={!shouldOptimize}
        {...props}
      />
    </Wrapper>
  );
}

export { Image };

const Wrapper = styled.div<{ isPlaceholder: boolean }>`
  position: relative;
  height: 100%;
  width: 100%;
  ${({ isPlaceholder }) =>
    isPlaceholder &&
    `
    img{
      transform: scale(1.1);
    }
  `}
`;
