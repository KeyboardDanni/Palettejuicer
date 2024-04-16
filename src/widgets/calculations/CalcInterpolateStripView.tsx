import { produce } from "immer";

import { CelSelector } from "../common/CelSelector";
import {
  CalcInterpolateStrip,
  LerpColorspace,
  LerpHueMode,
  lerpColorspaceData,
  lerpHueModeData,
} from "../../model/calculation/CalcInterpolateStrip";
import { CelIndex } from "../../model/Palette";
import { CalcPropertiesViewProps } from "../PropertiesView";
import { PopupMenu } from "../common/PopupMenu";
import { NumberSlider } from "../common/NumberSlider";

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

  function colorspaceButton(isOpen: boolean): JSX.Element {
    const className = isOpen ? "selected" : "";
    const colorspaceData = lerpColorspaceData[calc.colorspace];

    return (
      <button className={className} title={colorspaceData.description}>
        {colorspaceData.name} ▾
      </button>
    );
  }

  function hueModeButton(isOpen: boolean): JSX.Element {
    const className = isOpen ? "selected" : "";
    const hueModeData = lerpHueModeData[calc.hueMode];

    return (
      <button className={className} title={hueModeData.description}>
        {hueModeData.name} ▾
      </button>
    );
  }

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
          <PopupMenu button={colorspaceButton} items={lerpColorspaceData} onItemSelect={handleColorspaceChange} />
        </div>
        <div className="grid-label">
          <span>Blend hue mode</span>
        </div>
        <div>
          <PopupMenu button={hueModeButton} items={lerpHueModeData} onItemSelect={handleHueModeChange} />
        </div>
        <div className="grid-label">
          <span>Curve</span>
        </div>
        <div>
          <NumberSlider value={calc.curve} onChange={handleCurveChange} disabled={false} min={0} max={3} step={0.1} />
        </div>
      </div>
    </>
  );
}
