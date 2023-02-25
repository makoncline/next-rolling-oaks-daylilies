const S3_BUCKET_HOST_NAMES = [
  "daylily-catalog-images-stage.s3.amazonaws.com",
  "daylily-catalog-images.s3.amazonaws.com",
];

const PLACEHOLDER_URL = "boringavatars";

export const getImageUrls = (inputSrc: string) => {
  const fallback = {
    blur: "/assets/placeholder.png",
    thumb: inputSrc,
    full: inputSrc,
  };

  return fallback;
};

// web p images not working on old versions of safari
// export const getImageUrls = (inputSrc: string) => {
//   const fallback = {
//     blur: "/assets/placeholder.png",
//     thumb: inputSrc,
//     full: inputSrc,
//   };
//   try {
//     let isPlaceholder = inputSrc.includes(PLACEHOLDER_URL);
//     const inputSrcUrl = new URL(inputSrc);
//     const { hostname, pathname } = inputSrcUrl;
//     const shouldUseResizedImage = S3_BUCKET_HOST_NAMES.includes(hostname);
//     if (isPlaceholder || !shouldUseResizedImage) {
//       return fallback;
//     }
//     const filePathNoExt =
//       pathname.substring(0, pathname.lastIndexOf(".")) || pathname;
//     const resizedImagesBaseUrl = `https://${process.env.NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET}${filePathNoExt}`;
//     const resizedImagesExt = `.webp`;
//     return {
//       blur: `${resizedImagesBaseUrl}-placeholder${resizedImagesExt}`,
//       thumb: `${resizedImagesBaseUrl}-thumb${resizedImagesExt}`,
//       full: `${resizedImagesBaseUrl}${resizedImagesExt}`,
//     };
//   } catch {
//     return fallback;
//   }
// };
