import { ChangeEvent } from "react";
import { ControlledTextInput } from "./ControlledTextInput";
import { NullableNumber } from "../../util/math";

export type NumberSliderProps = {
  value: NullableNumber;
  onChange: (value: NullableNumber) => void;
  disabled?: boolean;
  min: number;
  max: number;
  step: number;
  allowNone?: boolean;
  backgroundStyle?: string;
};

const LIMIT_ROUNDING_ERROR = 0.0005;

export function NumberSlider(props: NumberSliderProps) {
  const sliderValue = props.value !== null && !Number.isNaN(props.value) ? props.value : 0;
  const textValue = props.value !== null ? props.value.toString() : "None";
  const displayValue =
    props.value !== null && !Number.isNaN(props.value) && props.step >= 1
      ? (Math.round(props.value * 10) / 10).toString()
      : textValue;
  const limitDistance = Math.abs(props.max - props.min);
  const limitMin = props.min - LIMIT_ROUNDING_ERROR * limitDistance;
  const limitMax = props.max + LIMIT_ROUNDING_ERROR * limitDistance;
  const className =
    props.value !== null && (props.value < limitMin || props.value > limitMax)
      ? "slider-container out-of-range"
      : "slider-container";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let value = null;

    if (event.target.value.length > 0) {
      value = parseFloat(event.target.value);
    }

    if ((value === null || Number.isNaN(value)) && !props.allowNone) {
      value = 0;
    }

    props.onChange(value);
  }

  const style = props.backgroundStyle
    ? ({ "--slider-track-background": props.backgroundStyle } as React.CSSProperties)
    : undefined;

  return (
    <>
      <div className="number-slider">
        <div className={className}>
          <input
            type="range"
            className={props.backgroundStyle ? "thick-slider" : undefined}
            value={sliderValue}
            onChange={handleChange}
            min={props.min}
            max={props.max}
            step={props.step}
            disabled={props.disabled}
            style={style}
          />
        </div>
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
