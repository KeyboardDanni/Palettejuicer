import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { immerable } from "immer";
import { useImmer } from "use-immer";

import { Color } from "../model/color/Color";
import { Palette } from "../model/Palette";
import { CelIndex } from "../util/cel";
import { ColorSelector } from "./common/ColorSelector";
import { PaletteView } from "./PaletteView";
import { CalculationsView, CalculationsViewProps } from "./calculations/CalculationsView";
import { PropertiesView, PropertiesViewProps } from "./PropertiesView";
import { Calculation } from "../model/calculation/Calculation";
import { PaletteAction, PaletteActionType } from "../reducers/PaletteReducer";
import { ProjectAction } from "../reducers/ProjectReducer";
import { Project } from "../model/Project";

class AppViewState {
  [immerable] = true;

  readonly activeColorIndex: CelIndex = { x: 0, y: 0 };
  readonly activeCalcIndex: number = 0;
}

type AppColorSelectorProps = {
  palette: Palette;
  activeColorIndex: CelIndex;
  onPaletteChange: React.Dispatch<PaletteAction>;
};

function AppColorSelector(props: AppColorSelectorProps) {
  const [showBase, setShowBase] = useState(false);

  useEffect(
    function () {
      if (showBase) {
        setShowBase(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally avoiding updates on showBase change
    [setShowBase, props.activeColorIndex]
  );

  function handleColorChange(color: Color) {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.SetBaseColor,
        args: { index: props.activeColorIndex, color },
      })
    );
  }

  function handleShowBaseClick() {
    setShowBase(!showBase);
  }

  const hasComputed = props.palette.isComputed(props.activeColorIndex);
  const computed = hasComputed && !showBase;
  const colorTypeName = computed ? "Computed" : "Base Color";
  let baseSwitchButton;

  if (hasComputed) {
    baseSwitchButton = (
      <>
        <label>
          <input type="checkbox" checked={showBase} onChange={handleShowBaseClick} />
          Edit Base
        </label>
      </>
    );
  }

  const color = computed
    ? props.palette.color(props.activeColorIndex)
    : props.palette.baseColor(props.activeColorIndex);

  return (
    <>
      <div id="sidebar-color-selector" className="section">
        <div className="header-bar">
          <span className="section-header">Color</span>
          <span className="section-subheader">∙</span>
          <span className="section-subheader">
            {colorTypeName} [{props.activeColorIndex.x}, {props.activeColorIndex.y}]
          </span>
          <div className="header-bar-spacer" />
          {baseSwitchButton}
        </div>
        <ColorSelector color={color} onColorChange={handleColorChange} computed={computed} />
      </div>
    </>
  );
}

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

function AppProperties(props: PropertiesViewProps) {
  const calcs = props.palette.calculations;
  const calc = calcs[props.activeCalcIndex];
  let subheader = "";

  if (calc) {
    const calcClass = calc.constructor as typeof Calculation;
    subheader = `${calcClass.calcName()} [${props.activeCalcIndex}]`;
  }

  return (
    <>
      <div id="sidebar-properties" className="section">
        <div className="header-bar">
          <span className="section-header">Properties</span>
          <span className="section-subheader" hidden={!calc}>
            ∙
          </span>
          <span className="section-subheader" hidden={!calc}>
            {subheader}
          </span>
          <div className="button-bar-spacer" />
        </div>
        <PropertiesView {...props} />
      </div>
    </>
  );
}

type AppPaletteProps = {
  palette: Palette;
  onPaletteChange: React.Dispatch<PaletteAction>;
  activeColorIndex: CelIndex;
  onIndexChange: (index: CelIndex) => void;
};

function AppPalette(props: AppPaletteProps) {
  const onIndexChange = props.onIndexChange;
  const handleClick = useCallback(
    function (index: CelIndex) {
      onIndexChange(index);
    },
    [onIndexChange]
  );

  return (
    <>
      <div id="document-palette" className="section">
        <div id="palette-inner-bg" className="section-gray-background">
          <PaletteView
            palette={props.palette}
            onPaletteChange={props.onPaletteChange}
            active={props.activeColorIndex}
            onIndexChange={handleClick}
          />
        </div>
      </div>
    </>
  );
}

export type AppBodyProps = {
  project: Project;
  onProjectChange: React.Dispatch<ProjectAction>;
};

const initialAppState = new AppViewState();

export function AppBody(props: AppBodyProps) {
  const [viewState, updateViewState] = useImmer(initialAppState);

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
      <div id="app-body">
        <div id="app-columns">
          <div id="document-sidebar">
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
          <AppPalette
            palette={props.project.palette}
            onPaletteChange={props.onProjectChange}
            activeColorIndex={viewState.activeColorIndex}
            onIndexChange={setActiveColorIndex}
          />
        </div>
      </div>
    </>
  );
}
