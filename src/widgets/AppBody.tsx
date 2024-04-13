import { ChangeEvent } from "react";
import { immerable, produce } from "immer";
import { Updater, useImmer } from "use-immer";

import { Color } from "../model/color/Color";
import { CelIndex, Palette } from "../model/Palette";
import { ColorSelector } from "./ColorSelector";
import { PaletteView } from "./PaletteView";
import { CalculationsView, CalculationsViewProps } from "./calculations/CalculationsView";

class AppViewState {
  [immerable] = true;

  readonly activeColorIndex: CelIndex = { x: 0, y: 0 };
  readonly activeCalcIndex: number = 0;
}

type AppColorSelectorProps = {
  palette: Palette;
  activeColorIndex: CelIndex;
  onPaletteChange: Updater<Palette>;
};

function AppColorSelector(props: AppColorSelectorProps) {
  function handleColorChange(color: Color) {
    const newPalette = props.palette.setSelectedColor(props.activeColorIndex, color);

    props.onPaletteChange(newPalette);
  }

  return (
    <>
      <div id="sidebar-color-selector" className="section">
        <span className="section-header">
          Selected Color ({props.activeColorIndex.x}, {props.activeColorIndex.y})
        </span>
        <ColorSelector color={props.palette.selectedColor(props.activeColorIndex)} onColorChange={handleColorChange} />
      </div>
    </>
  );
}

export function AppCalculations(props: CalculationsViewProps) {
  function handleCalcToggle(event: ChangeEvent<HTMLInputElement>) {
    props.onPaletteChange(
      produce(props.palette, (draft) => {
        draft.useCalculations = event.target.checked;
      })
    );
  }

  return (
    <>
      <div id="sidebar-calculations" className="section">
        <div className="header-bar">
          <span className="section-header">Calculations</span>
          <div className="button-bar-spacer" />
          <label>
            <input type="checkbox" checked={props.palette.useCalculations} onChange={handleCalcToggle} />
            Enabled
          </label>
        </div>
        <CalculationsView {...props} />
      </div>
    </>
  );
}

function AppProperties() {
  return (
    <>
      <div id="sidebar-properties" className="section">
        <span className="section-header">Properties</span>
        <div className="placeholder">Select a calculation to adjust its properties.</div>
      </div>
    </>
  );
}

type AppPaletteProps = {
  palette: Palette;
  activeColorIndex: CelIndex;
  onIndexChange: (index: CelIndex) => void;
};

function AppPalette(props: AppPaletteProps) {
  return (
    <>
      <div id="document-palette" className="section">
        <span className="section-header">Palette</span>
        <div id="palette-inner-bg" className="section-gray-background">
          <PaletteView
            palette={props.palette}
            active={props.activeColorIndex}
            onIndexClicked={(index) => props.onIndexChange(index)}
          />
        </div>
      </div>
    </>
  );
}

export function AppBody() {
  const [viewState, updateViewState] = useImmer(new AppViewState());
  const [palette, updatePalette] = useImmer(new Palette());

  function setActiveColorIndex(index: CelIndex) {
    updateViewState((draft) => {
      draft.activeColorIndex = index;
    });
  }

  function setActiveCalcIndex(index: number) {
    updateViewState((draft) => {
      draft.activeCalcIndex = index;
    });
  }

  return (
    <>
      <div id="app-body">
        <div id="app-columns">
          <div id="document-sidebar">
            <AppColorSelector
              palette={palette}
              onPaletteChange={updatePalette}
              activeColorIndex={viewState.activeColorIndex}
            />
            <AppCalculations
              palette={palette}
              onPaletteChange={updatePalette}
              activeCalcIndex={viewState.activeCalcIndex}
              onIndexChange={setActiveCalcIndex}
            />
            <AppProperties />
          </div>
          <AppPalette
            palette={palette}
            activeColorIndex={viewState.activeColorIndex}
            onIndexChange={setActiveColorIndex}
          />
        </div>
      </div>
    </>
  );
}
