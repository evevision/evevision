import React from "react";

interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  variant?: string;
  children: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = (props: ButtonProps) => (
  <div
    className={
      "eve-button" + (props.variant === undefined ? "" : "-" + props.variant)
    }
    onClick={props.onClick}
  >
    {props.children}
  </div>
);

interface TextInputProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  name?: string;
}
export const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => (
  <input
    className="eve-text-entry"
    value={props.value}
    onChange={props.onChange}
    readOnly={props.readOnly}
    style={props.style}
    name={props.name}
  />
);

interface SliderProps {
  min: number;
  max: number;
  value: number;
  style?: React.CSSProperties;
  onChange?: (value: number) => void;
}
export const SliderInput: React.FC<SliderProps> = (props: SliderProps) => {
  return (
    <input
      className="eve-range-slider"
      type="range"
      min={props.min}
      max={props.max}
      value={props.value}
      onChange={(e) =>
        props.onChange ? props.onChange(parseInt(e.target.value)) : ""
      }
      style={props.style}
    />
  );
};
