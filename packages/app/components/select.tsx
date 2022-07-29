import React from "react";
import styled from "styled-components";
import { Icon } from "@iconify/react";
import arrowDown from "@iconify/icons-si-glyph/arrow-down";

const Select: React.FC<{
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ name, value, onChange, children }) => {
  return (
    <Style>
      <div>
        <select
          aria-label={name}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onChange}
        >
          {children}
        </select>
        <Icon className="carat" icon={arrowDown} />
      </div>
    </Style>
  );
};

export default Select;

const Style = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  div {
    width: 100%;
    max-width: 35rem;
  }
  select {
    width: 100%;
    appearance: none;
    background-color: var(--bg-2);
    color: var(--text-high);
    font-size: 1rem;
    border: none;
    border-radius: 3rem;
    height: 2rem;
    margin: 0 auto;
    padding: 0 3rem 0 1rem;
    cursor: pointer;
    &:hover {
      box-shadow: 0 0 0 1px rgb(var(--rgb-purple));
    }
    &:focus {
      outline: none;
    }
    &:active {
      outline: none;
    }
  }
  .carat {
    position: relative;
    top: 0.2rem;
    right: 1.1rem;
    margin-left: -1rem;
    pointer-events: none;
  }
`;
