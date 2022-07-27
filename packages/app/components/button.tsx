import React from "react";
import styled from "styled-components";

type StyledButtonProps = {
  look: string;
  fullWidth: boolean;
};

type ButtonProps = {
  look: string;
  fullWidth: boolean;
  label: string;
};

const Button: React.FC<
  ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ onClick, look, fullWidth, children, label }) => (
  <StyledButton
    onClick={onClick}
    look={look}
    fullWidth={fullWidth}
    aria-label={label}
  >
    <div className="plate">
      <span className="text button">{children}</span>
    </div>
    <div className="focus-ring" />
  </StyledButton>
);

export default Button;

const StyledButton = styled.button<StyledButtonProps>`
  position: relative;
  height: 3.5rem;
  ${(props) => props.fullWidth && `width: 100%;`}
  border: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: background 250ms ease-in-out, transform 150ms ease;
  background: none;
  &:active {
    transform: scale(0.99);
  }
  .plate {
    height: 2.5rem;
    width: fit-content;
    ${(props) => props.fullWidth && `width: 100%;`}
    padding-left: 2rem;
    padding-right: 2rem;
    background: ${(props): string => {
      switch (props.look) {
        case "primary":
          return `var(--yellow--vivid--500)`;
        case "submit":
        case "secondary":
          return `var(--primary--100)`;
        case "light":
          return `none`;
        case "dark":
          return `none`;
        case "danger":
          return `var(--red--vivid--500)`;
        default:
          return "";
      }
    }};
    box-shadow: ${(props): string => {
      switch (props.look) {
        case "primary":
          return `var(--elevation--1)`;
        case "submit":
        case "secondary":
          return `var(--elevation--1)`;
        case "light":
          return `none`;
        case "dark":
          return `none`;
        default:
          return "";
      }
    }};
    border-radius: 0.625rem;
    margin: auto;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .text {
    color: ${(props): string => {
      switch (props.look) {
        case "primary":
          return `var(--yellow--vivid--1000)`;
        case "submit":
        case "secondary":
          return `var(--cyan--1000)`;
        case "light":
          return `var(--white)`;
        case "dark":
          return `var(--primary--1000)`;
        case "danger":
          return `var(--red--vivid--1000)`;
        default:
          return "";
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
      ${(props): string => {
        switch (props.look) {
          case "primary":
            return `var(--yellow--vivid--500)`;
          case "submit":
          case "secondary":
            return `rgb(var(--rgb-blue))`;
          default:
            return "";
        }
      }};
    box-sizing: border-box;
    border-radius: 10px;
  }
  &:focus {
    outline: none;
    .focus-ring {
      visibility: ${(props): string => {
        switch (props.look) {
          case "primary":
            return `visible`;
          case "submit":
          case "secondary":
            return `visible`;
          case "light":
            return `hidden`;
          case "dark":
            return `hidden`;
          default:
            return "";
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
      color: ${(props): string => {
        switch (props.look) {
          case "primary":
            return `var(--yellow--vivid--1000)`;
          case "submit":
          case "secondary":
            return `var(--cyan--1000)`;
          case "light":
            return `var(--yellow--vivid--200)`;
          case "dark":
            return `var(--cyan--500)`;
          case "danger":
            return `var(--red--vivid--1000)`;
          default:
            return "";
        }
      }};
    }
  }
`;
