import { ChangeEvent, ChangeEventHandler, useState } from "react";

export type IntermediateTextInputProps = {
  value: string;
  displayValue?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled: boolean;
  [key: string]: any;
};

export function ControlledTextInput({ value, displayValue, onChange, disabled, ...other }: IntermediateTextInputProps) {
  const [temp, setTemp] = useState<string>(value);
  const [tempActive, setTempActive] = useState(false);

  const editValue = tempActive ? temp : displayValue ?? value;

  function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    setTemp(value);
    setTempActive(true);
    event.target.value = value;
    event.target.select();
  }

  function handleBlur() {
    setTempActive(false);
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.disabled) return;

    onChange(event);
    setTemp(event.target.value);
  }

  return (
    <>
      <input
        type="text"
        tabIndex={0}
        readOnly={disabled}
        {...other}
        value={editValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleTextChange}
      />
    </>
  );
}
