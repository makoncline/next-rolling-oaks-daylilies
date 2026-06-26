export const getImageUrls = (inputSrc: string) => {
  return {
    blur: "/assets/placeholder.png",
    thumb: inputSrc,
    full: inputSrc,
  };
};
