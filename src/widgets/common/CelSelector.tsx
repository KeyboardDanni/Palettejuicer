import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";

import { CelIndex } from "../../util/cel";
import { ControlledTextInput } from "./ControlledTextInput";
import { clamp } from "../../util/math";
import { CelPickerContext, CelPickerSetterContext } from "../../contexts/CelPickerContext";

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
        inputMode="numeric"
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
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const celPicker = useContext(CelPickerContext);
  const setCelPicker = useContext(CelPickerSetterContext);

  useEffect(() => {
    function reset(event?: MouseEvent) {
      if (active && celPicker && setCelPicker && (!event || event.target !== ref.current)) {
        celPicker.onReset();
        setCelPicker(null);
      }
    }

    function keyboardReset(event: KeyboardEvent) {
      if (event.key === "Escape") {
        reset();
        event.preventDefault();
      }
    }

    document.addEventListener("mousedown", reset);
    document.addEventListener("keydown", keyboardReset);

    return () => {
      reset();
      document.removeEventListener("mousedown", reset);
      document.removeEventListener("keydown", keyboardReset);
    };
  }, [ref, active, celPicker, setCelPicker]);

  function handleChangeX(value: number) {
    onIndexChange({ x: value, y: index.y });
  }

  function handleChangeY(value: number) {
    onIndexChange({ x: index.x, y: value });
  }

  function handleClick() {
    if (!setCelPicker) {
      return;
    }

    setActive(!active);

    if (celPicker) {
      celPicker.onReset();
    }

    if (!active) {
      setCelPicker({
        currentIndex: index,
        onAccept: (index) => {
          onIndexChange(index);
          ref.current?.focus();
        },
        onReset: () => {
          setActive(false);
          ref.current?.focus();
        },
      });
    } else {
      setCelPicker(null);
    }
  }

  let className = "thin-button";

  if (active) {
    className += " selected";
  }

  return (
    <>
      <div className="cel-selector">
        <button className={className} title="Click to pick cel" onClick={handleClick} ref={ref}>
          <i className="icon-pick"></i>
        </button>
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
