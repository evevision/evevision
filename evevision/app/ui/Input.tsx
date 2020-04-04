import React from 'react';

interface ButtonProps {onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void), variant?: string}
export const Button: React.FC<ButtonProps> = (props: ButtonProps) => <div className={"eve-button" + (props.variant === undefined ? '' : ("-" + props.variant))} onClick={props.onClick}>{props.children}</div>

interface TextInputProps {
    onChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void)
    value?: String
}
export const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => <input className="eve-text-entry" value={props.value} onChange={props.onChange}/>

