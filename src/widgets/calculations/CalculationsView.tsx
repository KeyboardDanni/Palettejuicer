import React, { memo, useEffect, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { clamp } from "../../util/math";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";
import { PopupMenuChoiceData } from "../common/PopupMenu";

import { DropdownChoiceButton } from "../common/DropdownButton";
import { Calculation } from "../../model/calculation/Calculation";
import { availableCalcs } from "../../model/Palette";

export type CalculationsViewProps = {
  useCalculations: boolean;
  calculations: readonly Calculation[];
  activeCalcIndex: number;
  onPaletteChange: React.Dispatch<PaletteAction>;
  onIndexChange: (index: number) => void;
};

function AddCalculationButton(props: CalculationsViewProps) {
  const nextIndex = Math.min(props.activeCalcIndex + 1, props.calculations.length);
  const items: PopupMenuChoiceData[] = [];

  for (const calcClass of availableCalcs) {
    items.push({
      name: calcClass.value.calcName(),
      description: calcClass.value.description(),
    });
  }

  function handleAdd(index: number) {
    const calcClass = availableCalcs[index].value;

    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.AddCalculation,
        args: {
          index: nextIndex,
          calcClass,
        },
      })
    );

    props.onIndexChange(nextIndex);
  }

  return (
    <>
      <DropdownChoiceButton label={"Add"} items={items} onItemSelect={handleAdd} />
    </>
  );
}

type CalculationItemProps = {
  calculations: readonly Calculation[];
  index: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

function CalculationItem(props: CalculationItemProps) {
  useEffect(() => {
    if (props.index === props.activeIndex) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [props.index, props.activeIndex]);

  const ref = useRef<HTMLLIElement>(null);
  const calcs = props.calculations;
  const calculation = calcs[props.index];
  const className = props.index === props.activeIndex ? "active-calc" : "";

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
  const calcs = props.calculations;
  const items = [];

  if (props.calculations.length <= 0) {
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
    const calculation = props.calculations[i];

    items.push(
      <CalculationItem
        key={calculation.uid}
        calculations={props.calculations}
        index={i}
        activeIndex={activeIndex}
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

export const CalculationsView = memo(function (props: CalculationsViewProps) {
  const nextIndex = Math.min(props.activeCalcIndex + 1, props.calculations.length);
  const prevIndex = clamp(props.activeCalcIndex - 1, 0, props.calculations.length - 1);

  function handleClone() {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.CloneCalculation,
        args: {
          index: props.activeCalcIndex,
        },
      })
    );

    props.onIndexChange(nextIndex);
  }

  function handleRemove() {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.RemoveCalculation,
        args: {
          index: props.activeCalcIndex,
        },
      })
    );

    props.onIndexChange(prevIndex);
  }

  function handleMoveUp() {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.MoveCalculation,
        args: {
          index: props.activeCalcIndex,
          newIndex: prevIndex,
        },
      })
    );

    props.onIndexChange(prevIndex);
  }

  function handleMoveDown() {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.MoveCalculation,
        args: {
          index: props.activeCalcIndex,
          newIndex: nextIndex,
        },
      })
    );

    const newIndex = clamp(props.activeCalcIndex + 1, 0, props.calculations.length - 1);
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
});
