import React from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import styled from 'styled-components';
import Img from 'gatsby-image';

const ImgCarousel: React.FC<{ images: any[] }> = ({
  images,
}: {
  images: any[];
}) => {
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
            if (typeof image === 'string') {
              return (
                <div key={`image-${i}`} className='placeholder'>
                  <img
                    src={image}
                    alt={`image ${i}`}
                    style={{
                      position: 'unset',
                      width: '100%',
                      maxWidth: '100%',
                    }}
                  />
                </div>
              );
            }
            return (
              <div key={`image-${i}`} className='placeholder'>
                <Img
                  fixed={image}
                  alt={`image ${i}`}
                  style={{ position: 'unset', width: '100%', maxWidth: '100%' }}
                />
              </div>
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
