import React, { ChangeEventHandler, MouseEvent } from "react";
type set<T> = React.Dispatch<T>;
type InputPropsTypes = {
  // returnThis: string;
  placeholder?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  name?: string;
  type?: "text" | "password" | "number" | undefined;
  setReturnThis?: set<string>;
  className?: string;
  inputRef?: React.MutableRefObject<HTMLInputElement | null> | React.ForwardedRef<HTMLInputElement | null>;
  min?: number;
  max?: number;
  // onChange?: (e: ChangeEventHandler<HTMLInputElement>) => void;
  onChange: (e: React.InputHTMLAttributes.onChange) => void;
  /*rows:number;
  cols:number;*/

};
type ButtonPropsTypes = {
  type?: "submit" | "reset" | undefined;
  text?: string;
  name?: stringl;
  bgColor?: string;
  id?: string;
  className?: string;
  bonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  child?: JSX.Element
};
type ErrorPropsTypes = {
  message: string, className?: string
}
