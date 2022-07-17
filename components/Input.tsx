import React from "react";
import { InputPropsTypes } from "../typings/components";
const Input = React.forwardRef<HTMLInputElement, InputPropsTypes>(
  (props, ref) => {
    const { name, type, autoFocus, autoComplete, className, placeholder, min, max, onChange } =
      props;
    return (
      <input
        placeholder={placeholder}
        name={name}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`bg-neutral-100 border-gray-500 border-solid border-2 rounded-sm focus:outline-none caret-slate-900 ${className}`}
        ref={ref}
        min={min}
        max={max}
        /*cols = {cols}
        rows={rows}*/
        onChange={onChange}
      ></input>
    );
  }
);
Input.displayName = "Input";
export default Input;
