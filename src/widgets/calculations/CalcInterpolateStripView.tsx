import { produce } from "immer";

import { CelSelector } from "../common/CelSelector";
import {
  CalcInterpolateStrip,
  LerpColorspace,
  LerpHueMode,
  lerpColorspaceData,
  lerpHueModeData,
} from "../../model/calculation/CalcInterpolateStrip";
import { CelIndex } from "../../util/cel";
import { CalcPropertiesViewProps } from "../../model/calculation/Calculation";
import { NumberSlider } from "../common/NumberSlider";
import { DropdownChoiceButton } from "../common/DropdownButton";

export function CalcInterpolateStripView(props: CalcPropertiesViewProps) {
  if (!(props.calc instanceof CalcInterpolateStrip)) {
    throw new Error("Bad type");
  }

  const calc = props.calc as CalcInterpolateStrip;

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

  function handleColorspaceChange(index: number) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.colorspace = index as LerpColorspace;
      })
    );
  }

  function handleHueModeChange(index: number) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.hueMode = index as LerpHueMode;
      })
    );
  }

  function handleCurveChange(curve: number) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.curve = curve;
      })
    );
  }

  const colorspaceData = lerpColorspaceData[calc.colorspace];
  const hueModeData = lerpHueModeData[calc.hueMode];

  return (
    <>
      <div className="calc-grid">
        <div className="grid-label">
          <span>Cel range</span>
        </div>
        <div>
          <CelSelector index={calc.startCel} onIndexChange={handleStartChange} />
          <span className="label-mid">to</span>
          <CelSelector index={calc.endCel} onIndexChange={handleEndChange} />
        </div>
        <div className="grid-label">
          <span>Blend colorspace</span>
        </div>
        <div>
          <DropdownChoiceButton
            label={colorspaceData.name}
            title={colorspaceData.description}
            items={lerpColorspaceData}
            current={calc.colorspace}
            onItemSelect={handleColorspaceChange}
          />
        </div>
        <div className="grid-label">
          <span>Blend hue mode</span>
        </div>
        <div>
          <DropdownChoiceButton
            label={hueModeData.name}
            title={hueModeData.description}
            items={lerpHueModeData}
            current={calc.hueMode}
            onItemSelect={handleHueModeChange}
          />
        </div>
        <div className="grid-label">
          <span>Power curve</span>
        </div>
        <div>
          <NumberSlider value={calc.curve} onChange={handleCurveChange} disabled={false} min={0.1} max={3} step={0.1} />
        </div>
      </div>
    </>
  );
}
