import { ChangeEvent } from "react";

import { CalculationsView, CalculationsViewProps } from "./CalculationsView";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";

export function AppCalculations(props: CalculationsViewProps) {
  function handleCalcToggle(event: ChangeEvent<HTMLInputElement>) {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.EnableCalculations,
        args: {
          enabled: event.target.checked,
        },
      })
    );
  }

  return (
    <>
      <div id="sidebar-calculations" className="section">
        <div className="header-bar">
          <span className="section-header">Calculations</span>
          <div className="header-bar-spacer" />
          <label>
            <input type="checkbox" checked={props.useCalculations} onChange={handleCalcToggle} />
            Enabled
          </label>
        </div>
        <CalculationsView {...props} />
      </div>
    </>
  );
}
