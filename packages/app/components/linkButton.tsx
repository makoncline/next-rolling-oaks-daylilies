import React from 'react';
import styled from 'styled-components';

const LinkButton: React.FC<{
  href: string;
  target: string;
  lookType: string;
  fullWidth: boolean;
}> = ({ href, target, lookType, fullWidth, children }) => (
  <StyledLink lookType={lookType} fullWidth={fullWidth} tabindex='-1'>
    <a className='text button' href={href} target={target}>
      <div className='plate'>{children}</div>
    </a>
    <div className='focus-ring' />
  </StyledLink>
);

export default LinkButton;
const StyledLink = styled.button<{
  lookType: string;
  fullWidth: boolean;
  tabindex: string;
}>`
  position: relative;
  height: 3.5rem;
  ${props => props.fullWidth && `width: 100%;`}
  border: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: background 250ms ease-in-out, transform 150ms ease;
  &:active {
    transform: scale(0.99);
    outline: none;
  }
  background: none;
  .plate {
    height: 2.5rem;
    width: fit-content;
    ${props => props.fullWidth && `width: 100%;`}
    padding-left: 2rem;
    padding-right: 2rem;
    background: ${props => {
      switch (props.lookType) {
        case 'primary':
          return `var(--yellow--vivid--500)`;
        case 'secondary':
          return `var(--primary--100)`;
        case 'light':
          return `none`;
        case 'dark':
          return `none`;
        default:
          break;
      }
    }};
    box-shadow: ${props => {
      switch (props.lookType) {
        case 'primary':
          return `var(--elevation--1)`;
        case 'secondary':
          return `var(--elevation--1)`;
        case 'light':
          return `none`;
        case 'dark':
          return `none`;
        default:
          break;
      }
    }};
    border-radius: 0.625rem;
    margin: auto;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .text {
    text-decoration: none;
    color: ${props => {
      switch (props.lookType) {
        case 'primary':
          return `var(--yellow--vivid--1000)`;
        case 'secondary':
          return `var(--cyan--1000)`;
        case 'light':
          return `var(--white)`;
        case 'dark':
          return `var(--primary--1000)`;
        default:
          break;
      }
    }};
  }
  .focus-ring {
    position: absolute;
    visibility: hidden;
    height: 3.5rem;
    left: 0;
    right: 0;
    top: calc(50% - 3.5rem / 2);
    border: 4px solid
      ${props => {
        switch (props.lookType) {
          case 'primary':
            return `var(--yellow--vivid--500)`;
          case 'secondary':
            return `rgb(var(--rgb-blue))`;
          default:
            break;
        }
      }};
    box-sizing: border-box;
    border-radius: 10px;
  }
  &:focus {
    outline: none;
    .focus-ring {
      visibility: ${props => {
        switch (props.lookType) {
          case 'primary':
            return `visible`;
          case 'secondary':
            return `visible`;
          case 'light':
            return `hidden`;
          case 'dark':
            return `hidden`;
          default:
            break;
        }
      }};
    }
    .plate {
      box-shadow: none;
    }
  }
  &:hover {
    .plate {
      box-shadow: none;
    }
    .text {
      color: ${props => {
        switch (props.lookType) {
          case 'primary':
            return `var(--yellow--vivid--1000)`;
          case 'secondary':
            return `var(--cyan--1000)`;
          case 'light':
            return `var(--yellow--vivid--200)`;
          case 'dark':
            return `var(--cyan--500)`;
          default:
            break;
        }
      }};
    }
  }
`;
