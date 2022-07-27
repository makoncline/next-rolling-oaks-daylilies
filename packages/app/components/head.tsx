import React from 'react';
import styled from 'styled-components';
import Title from './title';

type HeadProps = {
  title: string;
  description?: string;
  left?: string;
  right?: string;
};

const Head: React.FC<HeadProps & React.HTMLAttributes<HTMLElement>> = ({
  title,
  description,
  left,
  right,
}) => {
  return (
    <Style>
      <Title title={title} />
      {description && <p className='description'>{description}</p>}
      {(left || right) && (
        <div className='bottom'>
          {left && <p className='left'>{left}</p>}
          {right && <p className='right'>{right}</p>}
        </div>
      )}
    </Style>
  );
};

export default Head;

const Style = styled.div`
  .description {
    display: block;
    margin: auto auto 1rem auto;
    max-width: 35rem;
  }
  .bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
    max-width: 35rem;
    margin: auto;
    .left {
      margin-bottom: 0;
    }
    .right {
      color: var(--text-low);
    }
    @media (max-width: 500px) {
      flex-direction: column;
      justify-content: flex-start;
    }
  }
`;
