import { ChangeEvent } from "react";
import { CelIndex } from "../../model/Palette";
import { ControlledTextInput } from "./ControlledTextInput";
import { clamp } from "../../util/math";

type CelNumberInputProps = {
  value: number;
  onValueChange: (value: number) => void;
  relative?: boolean;
  disabled: boolean;
  [key: string]: any;
};

function CelNumberInput({ value, onValueChange, disabled, relative, ...other }: CelNumberInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let newValue = parseInt(event.target.value) || 0;

    newValue = relative ? clamp(newValue, -999, 999) : clamp(newValue, 0, 999);

    onValueChange(newValue);
  }

  const valueString = value.toString();

  return (
    <>
      <ControlledTextInput
        {...other}
        value={valueString}
        displayValue={valueString}
        onChange={handleChange}
        disabled={disabled}
      />
    </>
  );
}

export type CelSelectorProps = {
  index: CelIndex;
  onIndexChange: (index: CelIndex) => void;
  relative?: boolean;
  disabled?: boolean;
  [key: string]: any;
};

export function CelSelector({ index, onIndexChange, relative, disabled, ...other }: CelSelectorProps) {
  function handleChangeX(value: number) {
    onIndexChange({ x: value, y: index.y });
  }

  function handleChangeY(value: number) {
    onIndexChange({ x: index.x, y: value });
  }

  return (
    <>
      <div className="cel-selector">
        <CelNumberInput
          {...other}
          name="x"
          value={index.x}
          onValueChange={handleChangeX}
          relative={relative}
          disabled={disabled ?? false}
        />
        <CelNumberInput
          {...other}
          name="y"
          value={index.y}
          onValueChange={handleChangeY}
          relative={relative}
          disabled={disabled ?? false}
        />
      </div>
    </>
  );
}
