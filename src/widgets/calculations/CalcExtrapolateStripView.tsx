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

enum ExtrapolatePage {
  Output = "Strip Options",
  Lightness = "Lightness",
  Chroma = "Chroma",
  Hue = "Hue",
}

function OutputPage(props: CalcPropertiesViewProps) {
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

  const colorspaceData = extrapolateSpaceData[calc.colorspace];

  return (
    <>
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
    </>
  );
}

type AdjustmentPageProps = {
  viewProps: CalcPropertiesViewProps;
  adjustment: string;
};

function AdjustmentPage(props: AdjustmentPageProps) {
  const calc = props.viewProps.calc as CalcExtrapolateStrip;
  const activeAdjustment = calc[props.adjustment as keyof CalcExtrapolateStrip] as StripAdjustment;

  function handleAdjustmentChange(channel: string, property: string, value: number) {
    props.viewProps.onCalcChange(
      produce(calc, (draft) => {
        const adjustment = draft[channel as keyof CalcExtrapolateStrip] as StripAdjustment;
        (adjustment[property as keyof StripAdjustment] as any) = value;
      })
    );
  }

  return (
    <>
      <div className="grid-label">
        <span>Delta</span>
      </div>
      <div>
        <NumberSlider
          value={activeAdjustment.delta}
          onChange={(value) => handleAdjustmentChange(props.adjustment, "delta", value)}
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
          onChange={(value) => handleAdjustmentChange(props.adjustment, "curve", value)}
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
          onChange={(value) => handleAdjustmentChange(props.adjustment, "midBoost", value)}
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
          onChange={(value) => handleAdjustmentChange(props.adjustment, "midCurve", value)}
          min={0.1}
          max={3}
          step={0.1}
        />
      </div>
    </>
  );
}

type ExtrapolatePageViewProps = {
  viewProps: CalcPropertiesViewProps;
  page: string;
};

function ExtrapolatePageView(props: ExtrapolatePageViewProps) {
  switch (props.page) {
    case ExtrapolatePage.Output:
      return <OutputPage {...props.viewProps} />;
    case ExtrapolatePage.Lightness:
      return <AdjustmentPage viewProps={props.viewProps} adjustment="adjustLightness" />;
    case ExtrapolatePage.Chroma:
      return <AdjustmentPage viewProps={props.viewProps} adjustment="adjustChroma" />;
    case ExtrapolatePage.Hue:
      return <AdjustmentPage viewProps={props.viewProps} adjustment="adjustHue" />;
    default:
      throw new Error("Bad enum");
  }
}

export function CalcExtrapolateStripView(props: CalcPropertiesViewProps) {
  const [page, setPage] = useState<string>(ExtrapolatePage.Output);

  if (!(props.calc instanceof CalcExtrapolateStrip)) {
    throw new Error("Bad type");
  }

  return (
    <>
      <div className="calc-grid">
        <div className="tabbar">
          <PageTab pageName={ExtrapolatePage.Output} onPageChange={setPage} activePage={page} />
          <PageTab pageName={ExtrapolatePage.Lightness} onPageChange={setPage} activePage={page} />
          <PageTab pageName={ExtrapolatePage.Chroma} onPageChange={setPage} activePage={page} />
          <PageTab pageName={ExtrapolatePage.Hue} onPageChange={setPage} activePage={page} />
        </div>
        <ExtrapolatePageView page={page} viewProps={props} />
      </div>
    </>
  );
}
