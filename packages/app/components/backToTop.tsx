import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

type BackToTopLinkProps = {
  percent: number;
};

const BackToTopLink = styled.a<BackToTopLinkProps>`
  position: fixed;
  bottom: 1%;
  right: 1%;
  background: var(--pink);
  color: white;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  border-radius: 3px;
  padding: 1rem;
  transition: opacity 0.2s;
  opacity: 0;
  text-decoration: none;
  ${(props): string =>
    props.percent > 0.1
      ? `
    opacity: 1;
  `
      : ``}
  @media screen and (max-width: 500px) {
    display: none;
  }
`;

function useScrollPosition(): number {
  const [percent, setPercent] = useState(0);

  function handleScroll(): void {
    if (
      document.scrollingElement?.scrollHeight &&
      document.documentElement.clientHeight
    ) {
      const scrollTop =
        document.scrollingElement.scrollHeight -
        document.documentElement.clientHeight;
      const howFar = document.documentElement.scrollTop / scrollTop;
      setPercent(howFar);
    }
  }

  useEffect(() => {
    // listen for window scroll event
    document.addEventListener('scroll', handleScroll);
    return (): void => {
      document.removeEventListener('scroll', handleScroll);
    };
  });

  return percent;
}

const BackToTop: React.FC = () => {
  const percent = useScrollPosition();
  return (
    <BackToTopLink href='#top' title='Back To Top' percent={percent}>
      &uarr;
    </BackToTopLink>
  );
};

export default BackToTop;
