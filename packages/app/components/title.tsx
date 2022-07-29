import React from 'react';
import styled from 'styled-components';

type TitleProps = {
  title: string;
};

const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <Style>
      <h1>
        <hr />
        <span>{title}</span>
      </h1>
    </Style>
  );
};

export default Title;

const Style = styled.div`
  h1 {
    position: relative;
    top: 0;
    left: 0;
    text-align: center;
    z-index: 2;
    span {
      background-color: var(--bg-3);
      padding: 0 0.25em;
    }
  }
  hr {
    background: linear-gradient(
      to right,
      rgb(var(--rgb-blue)),
      rgb(var(--rgb-purple))
    );
    height: 1px;
    width: 100%;
    border: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
`;
