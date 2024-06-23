import { produce } from "immer";
import { DraftFunction, useImmer } from "use-immer";
import { useCallback, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { ProjectAction } from "../reducers/ProjectReducer";
import { Palette } from "../model/Palette";
import { CelPickerContext, CelPickerData, CelPickerSetterContext } from "../contexts/CelPickerContext";
import { AppColorSelector } from "./sections/AppColorSelector";
import { AppCalculations } from "./sections/AppCalculations";
import { AppProperties } from "./sections/AppProperties";
import { AppPalette } from "./sections/AppPalette";
import { ProjectViewState, PaletteViewState } from "../model/ProjectViewState";

export type AppBodyProps = {
  palette: Palette;
  onProjectChange: React.Dispatch<ProjectAction>;
};

const initialProjectViewState = new ProjectViewState();

export function AppBody(props: AppBodyProps) {
  const [viewState, updateViewState] = useImmer(initialProjectViewState);
  const [celPicker, setCelPicker] = useState<CelPickerData | null>(null);
  let currentViewState = viewState;

  if (!props.palette.indexInBounds(viewState.palette.activeIndex)) {
    currentViewState = produce(currentViewState, (draft) => {
      draft.palette.activeIndex = props.palette.clampIndex(draft.palette.activeIndex);
    });
    updateViewState(currentViewState);
  }

  const setActiveCalcIndex = useCallback(
    function (index: number) {
      updateViewState((draft) => {
        draft.activeCalcIndex = index;
      });
    },
    [updateViewState]
  );

  const setPaletteViewState = useCallback(
    function (arg: PaletteViewState | DraftFunction<PaletteViewState>) {
      updateViewState((draft) => {
        if (arg instanceof PaletteViewState) {
          draft.palette = arg;
        } else {
          arg(draft.palette);
        }
      });
    },
    [updateViewState]
  );

  return (
    <>
      <CelPickerContext.Provider value={celPicker}>
        <CelPickerSetterContext.Provider value={setCelPicker}>
          <div id="app-body">
            <div id="app-columns">
              <div id="document-sidebar">
                <OverlayScrollbarsComponent options={{ scrollbars: { theme: "flat-scrollbar" } }} defer>
                  <div id="document-sidebar-column">
                    <AppColorSelector
                      palette={props.palette}
                      onPaletteChange={props.onProjectChange}
                      activeColorIndex={currentViewState.palette.activeIndex}
                    />
                    <AppCalculations
                      useCalculations={props.palette.useCalculations}
                      calculations={props.palette.calculations}
                      onPaletteChange={props.onProjectChange}
                      activeCalcIndex={currentViewState.activeCalcIndex}
                      onIndexChange={setActiveCalcIndex}
                    />
                    <AppProperties
                      palette={props.palette}
                      onPaletteChange={props.onProjectChange}
                      activeCalcIndex={currentViewState.activeCalcIndex}
                    />
                  </div>
                </OverlayScrollbarsComponent>
              </div>
              <AppPalette
                palette={props.palette}
                onPaletteChange={props.onProjectChange}
                viewState={currentViewState.palette}
                onViewStateChange={setPaletteViewState}
              />
            </div>
          </div>
        </CelPickerSetterContext.Provider>
      </CelPickerContext.Provider>
    </>
  );
}
