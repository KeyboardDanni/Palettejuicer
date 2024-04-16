import { ChangeEvent } from "react";
import { ControlledTextInput } from "./ControlledTextInput";

export type NumberSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min: number;
  max: number;
  step: number;
};

const LIMIT_ROUNDING_ERROR = 0.0001;

export function NumberSlider(props: NumberSliderProps) {
  const displayValue = props.step >= 1 ? Math.round(props.value * 10) / 10 : props.value;
  const limitMin = props.min - LIMIT_ROUNDING_ERROR;
  const limitMax = props.max + LIMIT_ROUNDING_ERROR;
  const className = props.value < limitMin || props.value > limitMax ? "out-of-range" : "";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value) || 0;

    props.onChange(value);
  }

  return (
    <>
      <div className="number-slider">
        <input
          type="range"
          className={className}
          value={props.value}
          onChange={handleChange}
          min={props.min}
          max={props.max}
          step={props.step}
          disabled={props.disabled}
        />
        <ControlledTextInput
          value={props.value.toString()}
          title={props.value.toString()}
          displayValue={displayValue.toString()}
          inputMode="decimal"
          onChange={handleChange}
          disabled={props.disabled ?? false}
        />
      </div>
    </>
  );
}
