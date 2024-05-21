import { immerable } from "immer";
import { useImmer } from "use-immer";
import { useCallback, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { CelIndex } from "../util/cel";
import { ProjectAction } from "../reducers/ProjectReducer";
import { Project } from "../model/Project";
import { CelPickerContext, CelPickerData, CelPickerSetterContext } from "../contexts/CelPickerContext";
import { AppColorSelector } from "./sections/AppColorSelector";
import { AppCalculations } from "./sections/AppCalculations";
import { AppProperties } from "./sections/AppProperties";
import { AppPalette } from "./sections/AppPalette";

class AppViewState {
  [immerable] = true;

  readonly activeColorIndex: CelIndex = { x: 0, y: 0 };
  readonly activeCalcIndex: number = 0;
}

export type AppBodyProps = {
  project: Project;
  onProjectChange: React.Dispatch<ProjectAction>;
};

const initialAppState = new AppViewState();

export function AppBody(props: AppBodyProps) {
  const [viewState, updateViewState] = useImmer(initialAppState);
  const [celPicker, setCelPicker] = useState<CelPickerData | null>(null);

  const setActiveColorIndex = useCallback(
    function (index: CelIndex) {
      updateViewState((draft) => {
        draft.activeColorIndex = index;
      });
    },
    [updateViewState]
  );

  const setActiveCalcIndex = useCallback(
    function (index: number) {
      updateViewState((draft) => {
        draft.activeCalcIndex = index;
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
                      activeColorIndex={viewState.activeColorIndex}
                    />
                    <AppCalculations
                      useCalculations={props.project.palette.useCalculations}
                      calculations={props.project.palette.calculations}
                      onPaletteChange={props.onProjectChange}
                      activeCalcIndex={viewState.activeCalcIndex}
                      onIndexChange={setActiveCalcIndex}
                    />
                    <AppProperties
                      palette={props.project.palette}
                      onPaletteChange={props.onProjectChange}
                      activeCalcIndex={viewState.activeCalcIndex}
                    />
                  </div>
                </OverlayScrollbarsComponent>
              </div>
              <AppPalette
                palette={props.project.palette}
                onPaletteChange={props.onProjectChange}
                activeColorIndex={viewState.activeColorIndex}
                onIndexChange={setActiveColorIndex}
              />
            </div>
          </div>
        </CelPickerSetterContext.Provider>
      </CelPickerContext.Provider>
    </>
  );
}
