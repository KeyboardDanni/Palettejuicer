import { ChangeEvent } from "react";

import { PropertiesView, PropertiesViewProps } from "./PropertiesView";
import { Calculation } from "../../model/calculation/Calculation";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";

function AppCalculationName(props: PropertiesViewProps) {
  const calcs = props.palette.calculations;
  const calc = calcs[props.activeCalcIndex];

  if (!calc) {
    return <></>;
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.RenameCalculation,
        args: { index: props.activeCalcIndex, customName: event.target.value },
      })
    );
  }

  const calcClass = calc.constructor as typeof Calculation;
  const placeholder = `${calcClass.calcName()} [${props.activeCalcIndex}]`;

  return (
    <>
      <span className="section-subheader">∙</span>
      <input
        className="section-header-rename"
        type="text"
        value={calc.customName}
        onChange={handleNameChange}
        placeholder={placeholder}
      />
    </>
  );
}
export function AppProperties(props: PropertiesViewProps) {
  return (
    <>
      <div id="sidebar-properties" className="section">
        <div className="header-bar">
          <span className="section-header">Properties</span>
          <AppCalculationName {...props} />
        </div>
        <PropertiesView {...props} />
      </div>
    </>
  );
}
