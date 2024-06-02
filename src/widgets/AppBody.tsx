import { produce } from "immer";
import { DraftFunction, useImmer } from "use-immer";
import { useCallback, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { ProjectAction } from "../reducers/ProjectReducer";
import { Project } from "../model/Project";
import { CelPickerContext, CelPickerData, CelPickerSetterContext } from "../contexts/CelPickerContext";
import { AppColorSelector } from "./sections/AppColorSelector";
import { AppCalculations } from "./sections/AppCalculations";
import { AppProperties } from "./sections/AppProperties";
import { AppPalette } from "./sections/AppPalette";
import { AppViewState, PaletteViewState } from "../model/AppViewState";

export type AppBodyProps = {
  project: Project;
  onProjectChange: React.Dispatch<ProjectAction>;
};

const initialAppState = new AppViewState();

export function AppBody(props: AppBodyProps) {
  const [viewState, updateViewState] = useImmer(initialAppState);
  const [celPicker, setCelPicker] = useState<CelPickerData | null>(null);
  let currentViewState = viewState;

  if (!props.project.palette.indexInBounds(viewState.palette.activeIndex)) {
    currentViewState = produce(currentViewState, (draft) => {
      draft.palette.activeIndex = props.project.palette.clampIndex(draft.palette.activeIndex);
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
                      palette={props.project.palette}
                      onPaletteChange={props.onProjectChange}
                      activeColorIndex={currentViewState.palette.activeIndex}
                    />
                    <AppCalculations
                      useCalculations={props.project.palette.useCalculations}
                      calculations={props.project.palette.calculations}
                      onPaletteChange={props.onProjectChange}
                      activeCalcIndex={currentViewState.activeCalcIndex}
                      onIndexChange={setActiveCalcIndex}
                    />
                    <AppProperties
                      palette={props.project.palette}
                      onPaletteChange={props.onProjectChange}
                      activeCalcIndex={currentViewState.activeCalcIndex}
                    />
                  </div>
                </OverlayScrollbarsComponent>
              </div>
              <AppPalette
                palette={props.project.palette}
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
