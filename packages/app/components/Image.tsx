import Image from "next/image";

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

export function BlurPlaceholder({ source }: { source: ImageSource }) {
  const { blurUrl } = toImageSource(source);
  if (!blurUrl) return null;

  return (
    <Image
      src={blurUrl}
      alt=""
      aria-hidden="true"
      fill
      sizes="600px"
      className="scale-110 object-cover blur-lg"
      unoptimized
    />
  );
}

export const getDevImageRevealClassName = (inputSrc: ImageSource) => {
  const source = toImageSource(inputSrc);

  if (process.env.NODE_ENV !== "development" || !source.blurUrl) {
    return undefined;
  }

  return "opacity-0 animate-image-reveal";
};
