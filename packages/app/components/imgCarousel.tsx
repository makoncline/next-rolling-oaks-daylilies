import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import styled from "styled-components";
import { Image } from "./Image";
import { SquareImage } from "../../design-system/src";

const ImgCarousel = ({ images }: { images: string[] }) => {
  return (
    <Style>
      <Carousel
        showArrows
        showStatus={false}
        showIndicators
        infiniteLoop
        showThumbs={false}
        useKeyboardArrows
        autoPlay
        stopOnHover
        swipeable
        dynamicHeight={false}
        emulateTouch
        thumbWidth={100}
        selectedItem={0}
        interval={3000}
        transitionTime={150}
        swipeScrollTolerance={5}
      >
        {images &&
          images.map((image, i) => {
            return (
              <SquareImage key={i}>
                <Image src={image} alt={`image ${i}`} />
              </SquareImage>
            );
          })}
      </Carousel>
    </Style>
  );
};

export default ImgCarousel;

const Style = styled.div`
  .placeholder {
    width: 100%;
    height: 0;
    padding-bottom: 100%;
  }
  img {
    background-color: var(--bg-5);
  }
`;
