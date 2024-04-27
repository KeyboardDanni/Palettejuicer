import { produce } from "immer";

import { CelIndex } from "../../util/cel";
import { CalcPropertiesViewProps } from "../PropertiesView";
import { CelSelector } from "../common/CelSelector";
import { CalcGamutMap, GamutMapAlgorithm, gamutMapData } from "../../model/calculation/CalcGamutMap";
import { DropdownChoiceButton } from "../common/DropdownButton";

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
            onItemSelect={handleAlgorithmChange}
          />
        </div>
      </div>
    </>
  );
}
