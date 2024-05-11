import { ChangeEvent } from "react";
import { ControlledTextInput } from "./ControlledTextInput";

export type NumberSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min: number;
  max: number;
  step: number;
  allowNone?: boolean;
};

const LIMIT_ROUNDING_ERROR = 0.0001;

export function NumberSlider(props: NumberSliderProps) {
  const sliderValue = !Number.isNaN(props.value) ? props.value : 0;
  const textValue = !Number.isNaN(props.value) ? props.value.toString() : "None";
  const displayValue =
    !Number.isNaN(props.value) && props.step >= 1 ? (Math.round(props.value * 10) / 10).toString() : textValue;
  const limitDistance = Math.abs(props.max - props.min);
  const limitMin = props.min - LIMIT_ROUNDING_ERROR * limitDistance;
  const limitMax = props.max + LIMIT_ROUNDING_ERROR * limitDistance;
  const className = props.value < limitMin || props.value > limitMax ? "out-of-range" : "";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let value = parseFloat(event.target.value);
    if (Number.isNaN(value) && !props.allowNone) {
      value = 0;
    }

    props.onChange(value);
  }

  return (
    <>
      <div className="number-slider">
        <input
          type="range"
          className={className}
          value={sliderValue}
          onChange={handleChange}
          min={props.min}
          max={props.max}
          step={props.step}
          disabled={props.disabled}
        />
        <ControlledTextInput
          value={textValue}
          title={textValue}
          displayValue={displayValue}
          inputMode="decimal"
          onChange={handleChange}
          disabled={props.disabled ?? false}
        />
      </div>
    </>
  );
}
