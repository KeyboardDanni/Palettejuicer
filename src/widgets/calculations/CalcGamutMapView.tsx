import { produce } from "immer";

import { CelIndex } from "../../util/cel";
import { CalcPropertiesViewProps } from "../../model/calculation/Calculation";
import { CelSelector } from "../common/CelSelector";
import { CalcGamutMap } from "../../model/calculation/CalcGamutMap";
import { DropdownChoiceButton } from "../common/DropdownButton";
import { GamutMapAlgorithm, gamutMapData } from "../../model/color/Color";

export function CalcGamutMapView(props: CalcPropertiesViewProps) {
  if (!(props.calc instanceof CalcGamutMap)) {
    throw new Error("Bad type");
  }

  const calc = props.calc as CalcGamutMap;

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

  function handleAlgorithmChange(index: number) {
    props.onCalcChange(
      produce(calc, (draft) => {
        draft.algorithm = index as GamutMapAlgorithm;
      })
    );
  }

  const gamutData = gamutMapData[calc.algorithm];

  return (
    <>
      <div className="calc-grid">
        <div className="grid-label">
          <span>Range</span>
        </div>
        <div>
          <CelSelector index={calc.startCel} onIndexChange={handleStartChange} />
          <span className="label-mid">to</span>
          <CelSelector index={calc.endCel} onIndexChange={handleEndChange} />
        </div>
        <div className="grid-label">
          <span>Algorithm</span>
        </div>
        <div>
          <DropdownChoiceButton
            label={gamutData.name}
            title={gamutData.description}
            items={gamutMapData}
            current={calc.algorithm}
            onItemSelect={handleAlgorithmChange}
          />
        </div>
      </div>
    </>
  );
}
