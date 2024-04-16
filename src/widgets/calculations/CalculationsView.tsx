import React, { useEffect, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { clamp } from "../../util/math";
import { Palette } from "../../model/Palette";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";
import { PopupMenu, PopupMenuItemData } from "../common/PopupMenu";

import { CalcCopyColors } from "../../model/calculation/CalcCopyColors";
import { CalcInterpolateStrip } from "../../model/calculation/CalcInterpolateStrip";

const AVAILABLE_CALCS = [CalcCopyColors, CalcInterpolateStrip];

export type CalculationsViewProps = {
  palette: Palette;
  activeCalcIndex: number;
  onPaletteChange: React.Dispatch<PaletteAction>;
  onIndexChange: (index: number) => void;
};

function AddCalculationButton(props: CalculationsViewProps) {
  const nextIndex = Math.min(props.activeCalcIndex + 1, props.palette.calculations.length);
  const items: PopupMenuItemData[] = [];

  for (const calcClass of AVAILABLE_CALCS) {
    items.push({
      name: calcClass.name(),
      description: calcClass.description(),
    });
  }

  function addButton(isOpen: boolean): JSX.Element {
    const className = isOpen ? "selected" : "";

    return <button className={className}>Add</button>;
  }

  function handleAdd(index: number) {
    const calcClass = AVAILABLE_CALCS[index];

    props.onPaletteChange({
      actionType: PaletteActionType.AddCalculation,
      args: {
        index: nextIndex,
        calcClass,
      },
    });

    props.onIndexChange(nextIndex);
  }

  return (
    <>
      <PopupMenu button={addButton} items={items} onItemSelect={handleAdd} />
    </>
  );
}

type CalculationItemProps = {
  palette: Palette;
  index: number;
  active: boolean;
  onIndexChange: (index: number) => void;
};

function CalculationItem(props: CalculationItemProps) {
  useEffect(() => {
    if (props.active) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  const ref = useRef<HTMLLIElement>(null);
  const calcs = props.palette.calculations;
  const calculation = calcs[props.index];
  const className = props.active ? "active-calc" : "";

  function handleMouseDown(event: React.MouseEvent) {
    if (event.buttons === 1) {
      props.onIndexChange(props.index);
    }
  }

  function handleMouseEnter(event: React.MouseEvent) {
    if (event.buttons === 1) {
      props.onIndexChange(props.index);
    }
  }

  const description = calculation.listDescription();

  return (
    <>
      <li ref={ref} className={className} onMouseDown={handleMouseDown} onMouseEnter={handleMouseEnter}>
        <div className="calc-label" title={description}>
          {description}
        </div>
      </li>
    </>
  );
}

function CalculationsList(props: CalculationsViewProps) {
  const calcs = props.palette.calculations;
  const items = [];

  if (props.palette.calculations.length <= 0) {
    return (
      <>
        <div className="placeholder">
          No calculations defined. Click 'Add' to start generating new shades of colors.
        </div>
      </>
    );
  }

  function handleKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        props.onIndexChange(Math.min(props.activeCalcIndex + 1, calcs.length - 1));
        event.preventDefault();
        break;
      case "ArrowUp":
        props.onIndexChange(Math.max(0, props.activeCalcIndex - 1));
        event.preventDefault();
        break;
      case "PageUp":
      case "PageDown":
      case "Home":
      case "End":
        event.preventDefault();
        break;
    }
  }

  const activeIndex = props.activeCalcIndex;

  for (let i = 0; i < calcs.length; i++) {
    const active = i === activeIndex;
    const calculation = props.palette.calculations[i];

    items.push(
      <CalculationItem
        key={calculation.uid}
        palette={props.palette}
        index={i}
        active={active}
        onIndexChange={props.onIndexChange}
      />
    );
  }

  return (
    <>
      <div className="calculations-list">
        <div className="calculations-scroll" onKeyDown={handleKey} tabIndex={0}>
          <OverlayScrollbarsComponent defer>
            <ul>{items}</ul>
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </>
  );
}

export function CalculationsView(props: CalculationsViewProps) {
  const calcs = props.palette.calculations;
  const nextIndex = Math.min(props.activeCalcIndex + 1, calcs.length);
  const prevIndex = clamp(props.activeCalcIndex - 1, 0, calcs.length - 1);

  function handleClone() {
    props.onPaletteChange({
      actionType: PaletteActionType.CloneCalculation,
      args: {
        index: props.activeCalcIndex,
      },
    });

    props.onIndexChange(nextIndex);
  }

  function handleRemove() {
    props.onPaletteChange({
      actionType: PaletteActionType.RemoveCalculation,
      args: {
        index: props.activeCalcIndex,
      },
    });

    props.onIndexChange(prevIndex);
  }

  function handleMoveUp() {
    props.onPaletteChange({
      actionType: PaletteActionType.MoveCalculation,
      args: {
        index: props.activeCalcIndex,
        newIndex: prevIndex,
      },
    });

    props.onIndexChange(prevIndex);
  }

  function handleMoveDown() {
    props.onPaletteChange({
      actionType: PaletteActionType.MoveCalculation,
      args: {
        index: props.activeCalcIndex,
        newIndex: nextIndex,
      },
    });

    const newIndex = clamp(props.activeCalcIndex + 1, 0, calcs.length - 1);
    props.onIndexChange(newIndex);
  }

  return (
    <>
      <div className="button-bar">
        <AddCalculationButton {...props} />
        <button onClick={handleClone}>Clone</button>
        <button onClick={handleRemove}>Remove</button>
        <div className="button-bar-spacer" />
        <button onClick={handleMoveUp}>Up</button>
        <button onClick={handleMoveDown}>Down</button>
      </div>
      <CalculationsList {...props} />
    </>
  );
}
