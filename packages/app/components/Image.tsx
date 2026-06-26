import type { CSSProperties } from "react";

export type ImageSource =
  | string
  | {
      url: string;
      thumbUrl?: string | null;
      blurUrl?: string | null;
    };

const toImageSource = (inputSrc: ImageSource) => {
  if (typeof inputSrc === "string") {
    return {
      url: inputSrc,
      thumbUrl: null,
      blurUrl: null,
    };
  }

  return inputSrc;
};

export const getImageUrls = (inputSrc: ImageSource) => {
  const source = toImageSource(inputSrc);

  return {
    blur: source.blurUrl || "/assets/placeholder.png",
    thumb: source.thumbUrl || source.url,
    full: source.url,
  };
};

export const getBlurPlaceholderStyle = (
  inputSrc: ImageSource
): CSSProperties | undefined => {
  const source = toImageSource(inputSrc);

  if (!source.blurUrl) {
    return undefined;
  }

  return {
    backgroundImage: `url("${source.blurUrl}")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
};
