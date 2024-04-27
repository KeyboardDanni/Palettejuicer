import { produce } from "immer";
import { useState } from "react";

import {
  CalcExtrapolateStrip,
  ExtrapolateColorspace,
  StripAdjustment,
  extrapolateSpaceData,
} from "../../model/calculation/CalcExtrapolateStrip";
import { CelIndex } from "../../util/cel";
import { CalcPropertiesViewProps } from "../PropertiesView";
import { CelSelector } from "../common/CelSelector";
import { NumberSlider } from "../common/NumberSlider";
import { PageTab } from "../common/PageTab";
import { DropdownChoiceButton } from "../common/DropdownButton";

enum AdjustmentPage {
  Lightness = "adjustLightness",
  Chroma = "adjustChroma",
  Hue = "adjustHue",
}

enum AdjustmentPageName {
  Lightness = "Lightness",
  Chroma = "Chroma",
  Hue = "Hue",
}

export function CalcExtrapolateStripView(props: CalcPropertiesViewProps) {
  const [page, setPage] = useState<string>(AdjustmentPage.Lightness);

  if (!(props.calc instanceof CalcExtrapolateStrip)) {
    throw new Error("Bad type");
  }

  const calc = props.calc as CalcExtrapolateStrip;

  function handleInputChange(index: CelIndex) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.inputCel = index;
      })
    );
  }

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
        draft.colorspace = index as ExtrapolateColorspace;
      })
    );
  }

  function handleAdjustmentChange(channel: string, property: string, value: number) {
    props.onCalcChange(
      produce(calc, (draft) => {
        const adjustment = draft[channel as keyof CalcExtrapolateStrip] as StripAdjustment;
        (adjustment[property as keyof StripAdjustment] as any) = value;
      })
    );
  }

  const activeAdjustment = props.calc[page as keyof CalcExtrapolateStrip] as StripAdjustment;
  const colorspaceData = extrapolateSpaceData[calc.colorspace];

  return (
    <>
      <div className="calc-grid">
        <div className="grid-label">
          <span>Input</span>
        </div>
        <div>
          <CelSelector index={calc.inputCel} onIndexChange={handleInputChange} />
        </div>
        <div className="grid-label">
          <span>Output range</span>
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
            items={extrapolateSpaceData}
            onItemSelect={handleColorspaceChange}
          />
        </div>
        <div className="tabbar">
          <PageTab
            groupName="adjustment"
            pageName={AdjustmentPage.Lightness}
            displayName={AdjustmentPageName.Lightness}
            onPageChange={setPage}
            activePage={page}
          />
          <PageTab
            groupName="adjustment"
            pageName={AdjustmentPage.Chroma}
            displayName={AdjustmentPageName.Chroma}
            onPageChange={setPage}
            activePage={page}
          />
          <PageTab
            groupName="adjustment"
            pageName={AdjustmentPage.Hue}
            displayName={AdjustmentPageName.Hue}
            onPageChange={setPage}
            activePage={page}
          />
        </div>
        <div className="grid-label">
          <span>Delta</span>
        </div>
        <div>
          <NumberSlider
            value={activeAdjustment.delta}
            onChange={(value) => handleAdjustmentChange(page, "delta", value)}
            min={-100}
            max={100}
            step={2}
          />
        </div>
        <div className="grid-label">
          <span>Power curve</span>
        </div>
        <div>
          <NumberSlider
            value={activeAdjustment.curve}
            onChange={(value) => handleAdjustmentChange(page, "curve", value)}
            min={0.1}
            max={3}
            step={0.1}
          />
        </div>
        <div className="grid-label">
          <span>Midrange boost</span>
        </div>
        <div>
          <NumberSlider
            value={activeAdjustment.midBoost}
            onChange={(value) => handleAdjustmentChange(page, "midBoost", value)}
            min={-100}
            max={100}
            step={2}
          />
        </div>
        <div className="grid-label">
          <span>Midrange power curve</span>
        </div>
        <div>
          <NumberSlider
            value={activeAdjustment.midCurve}
            onChange={(value) => handleAdjustmentChange(page, "midCurve", value)}
            min={0.1}
            max={3}
            step={0.1}
          />
        </div>
      </div>
    </>
  );
}
