import React, { ReactElement } from 'react';
import styled from 'styled-components';

type ContainerProps = {
  head?: ReactElement;
  content?: ReactElement;
  foot?: ReactElement;
};

const Container: React.FC<ContainerProps> = ({ head, content, foot }) => {
  return (
    <Style>
      {head && <div className='head'>{head}</div>}
      {content && <div className='content'>{content}</div>}
      {foot && <div className='foot'>{foot}</div>}
    </Style>
  );
};

export default Container;

const Style = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 1rem;
  .head,
  .content,
  .foot {
    width: 100%;
    padding: 1rem;
  }
  .head,
  .foot {
    min-height: 1.5rem;
    background-color: var(--bg-3);
  }
  .head {
    border-radius: 1.5rem 1.5rem 0 0;
  }
  .content {
    background-color: var(--bg-4);
  }
  .foot {
    border-radius: 0 0 1.5rem 1.5rem;
  }
`;
