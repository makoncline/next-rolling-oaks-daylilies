import React from "react";
import styled from "styled-components";
import { Alert, Button } from "@packages/design-system";

export const DaylilyCatalogAd = () => {
  return (
    <Wrapper>
      <Alert type="success">
        <Alert.Heading>Build Your Own Daylily Website!</Alert.Heading>
        <p>
          With DaylilyCatalog.com, you can build your own daylily website and
          share your flowers with the world. With our easy-to-use tools, you can
          add your daylily listings, upload photos, make lists, and have access
          to data and photos of 90,000+ registered daylilies with just a few
          clicks.
        </p>
        <Button
          as="a"
          href="https://daylilycatalog.com"
          styleType="primary"
          block
        >
          Get Started For Free!
        </Button>
      </Alert>
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
