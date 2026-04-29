import React from "react";
import { DebounceInput } from "react-debounce-input";

const Input: React.FC<{
  name: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, placeholder, value, onChange }) => {
  return (
    <div className="w-full">
      <DebounceInput
        className="mx-auto block w-full max-w-[35rem] border-0 bg-ro-surface2 p-2 text-base text-ro-text-high"
        debounceTimeout={500}
        id={name}
        name={name}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onChange}
      />
    </div>
  );
};

export default Input;
