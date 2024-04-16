import { ChangeEvent } from "react";
import { CelIndex } from "../model/Palette";
import { ControlledTextInput } from "./ControlledTextInput";
import { clamp } from "../util/math";

export type CelNumberInputProps = {
  value: number;
  onValueChange: (value: number) => void;
  [key: string]: any;
};

function CelNumberInput({ value, onValueChange, ...other }: CelNumberInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = clamp(parseInt(event.target.value) || 0, 0, 999);
    onValueChange(newValue);
  }

  const valueString = value.toString();

  return (
    <>
      <ControlledTextInput {...other} value={valueString} displayValue={valueString} onChange={handleChange} />
    </>
  );
}

export type CelSelectorProps = {
  index: CelIndex;
  onIndexChange: (index: CelIndex) => void;
};

export function CelSelector(props: CelSelectorProps) {
  function handleChangeX(value: number) {
    props.onIndexChange({ x: value, y: props.index.y });
  }

  function handleChangeY(value: number) {
    props.onIndexChange({ x: props.index.x, y: value });
  }

  return (
    <>
      <div className="cel-selector">
        <CelNumberInput name="x" value={props.index.x} onValueChange={handleChangeX} />
        <CelNumberInput name="y" value={props.index.y} onValueChange={handleChangeY} />
      </div>
    </>
  );
}
