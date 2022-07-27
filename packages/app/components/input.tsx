import React from 'react';
import styled from 'styled-components';
import { DebounceInput } from 'react-debounce-input';

const Input: React.FC<{
  name: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, placeholder, value, onChange }) => {
  return (
    <Style>
      <DebounceInput
        debounceTimeout={500}
        id={name}
        name={name}
        placeholder={placeholder}
        type='text'
        value={value}
        onChange={onChange}
        onBlur={onChange}
      />
    </Style>
  );
};

export default Input;

const Style = styled.div`
  width: 100%;
  input {
    display: block;
    width: 100%;
    max-width: 35rem;
    padding: 0.5rem;
    margin: 0 auto;
    font-size: 1rem;
    background-color: var(--bg-1);
    color: var(--text-high);
    border: none;
  }
`;
