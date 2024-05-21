import { produce } from "immer";

import { CelIndex } from "../../util/cel";
import { CalcCopyColors, MAX_COPIES } from "../../model/calculation/CalcCopyColors";
import { CalcPropertiesViewProps } from "../../model/calculation/Calculation";
import { CelSelector } from "../common/CelSelector";
import { ControlledTextInput } from "../common/ControlledTextInput";
import { ChangeEvent } from "react";
import { clamp } from "../../util/math";

export function CalcCopyColorsView(props: CalcPropertiesViewProps) {
  if (!(props.calc instanceof CalcCopyColors)) {
    throw new Error("Bad type");
  }

  const calc = props.calc as CalcCopyColors;

  function handleStartChange(index: CelIndex) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.startCel = index;
      })
    );
  }

  function handleEndChange(index: CelIndex) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.endCel = index;
      })
    );
  }

  function handleOffsetChange(index: CelIndex) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.offset = index;
      })
    );
  }

  function handleCopiesChange(event: ChangeEvent<HTMLInputElement>) {
    const copies = clamp(parseInt(event.target.value) ?? 1, 1, MAX_COPIES);

    props.onCalcChange(
      produce(calc, (draft) => {
        draft.copies = copies;
      })
    );
  }

  return (
    <>
      <div className="calc-grid">
        <div className="grid-label">
          <span>Source range</span>
        </div>
        <div>
          <CelSelector index={calc.startCel} onIndexChange={handleStartChange} />
          <span className="label-mid">to</span>
          <CelSelector index={calc.endCel} onIndexChange={handleEndChange} />
        </div>
        <div className="grid-label">
          <span>Destination offset</span>
        </div>
        <div>
          <CelSelector index={calc.offset} relative={true} onIndexChange={handleOffsetChange} />
        </div>
        <div className="grid-label">
          <span>Copies</span>
        </div>
        <div>
          <ControlledTextInput
            className="small-number-input"
            value={calc.copies.toString()}
            onChange={handleCopiesChange}
            disabled={false}
          />
        </div>
      </div>
    </>
  );
}
