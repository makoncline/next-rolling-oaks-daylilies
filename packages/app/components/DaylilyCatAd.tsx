import React from 'react';
import styled from 'styled-components';

export const DaylilyCatAd = () => {
  return (
    <Wrapper>
      <Article>
        <h2>Build Your Own Daylily Website!</h2>
        <p>
          With DaylilyCatalog.com, you can build your own daylily website and
          share your flowers with the world. With our easy-to-use tools, you can
          add your daylily listings, upload photos, make lists, and have access
          to data and photos of 90,000+ registered daylilies with just a few
          clicks.
        </p>
        <a href='https://app.daylilycatalog.com'>Get Started For Free!</a>
      </Article>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  margin-top: 3rem;
  justify-content: center;
`;
const Article = styled.article`
  width: 100%;
  padding: 1rem;
  background: var(--bg-2);
  border-radius: 5px;
  margin: 1rem;
`;
