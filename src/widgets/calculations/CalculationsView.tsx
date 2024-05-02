import React, { ChangeEvent, memo, useCallback, useEffect, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { clamp } from "../../util/math";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";
import { PopupMenuChoiceData } from "../common/PopupMenu";

import { DropdownChoiceButton } from "../common/DropdownButton";
import { Calculation } from "../../model/calculation/Calculation";
import { availableCalcs } from "../../model/Palette";
import { produce } from "immer";

class CalculationsListRefState {
  scrubbing: boolean = false;
}

function AddCalculationButton(props: CalculationsViewProps) {
  const nextIndex = Math.min(props.activeCalcIndex + 1, props.calculations.length);
  const items: PopupMenuChoiceData[] = [];

  for (const calcClass of availableCalcs) {
    items.push({
      name: calcClass.value.calcName(),
      description: calcClass.value.description(),
      beginGroup: calcClass.beginGroup === true,
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
  refState: React.MutableRefObject<CalculationsListRefState>;
  onIndexChange: (index: number) => void;
  onPaletteChange: React.Dispatch<PaletteAction>;
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
    if (props.refState.current.scrubbing && event.buttons === 1) {
      props.onIndexChange(props.index);
    }
  }

  function handleToggleEnabled(event: ChangeEvent<HTMLInputElement>) {
    const newCalc = produce(calculation, (draft) => {
      draft.enabled = event.target.checked;
    });

    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.SetCalculation,
        args: { index: props.index, calc: newCalc },
      })
    );
  }

  const description = calculation.listDescription();

  return (
    <>
      <li ref={ref} className={className} onMouseDown={handleMouseDown} onMouseEnter={handleMouseEnter}>
        <div className="calc-label" title={description}>
          <label className="flat-checkbox">
            <input type="checkbox" checked={calculation.enabled} onChange={handleToggleEnabled} tabIndex={-1} />
          </label>
          {description}
        </div>
      </li>
    </>
  );
}

function CalculationsList(props: CalculationsViewProps) {
  const refState = useRef(new CalculationsListRefState());
  const handleClick = useCallback(
    function () {
      refState.current.scrubbing = true;
    },
    [refState]
  );
  useEffect(() => {
    function unsetScrub() {
      refState.current.scrubbing = false;
    }

    document.addEventListener("mouseup", unsetScrub);

    return () => {
      document.removeEventListener("mouseup", unsetScrub);
    };
  }, [refState]);
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
    let newCalc;

    switch (event.key) {
      case "ArrowDown":
        props.onIndexChange(Math.min(props.activeCalcIndex + 1, calcs.length - 1));
        event.preventDefault();
        break;
      case "ArrowUp":
        props.onIndexChange(Math.max(0, props.activeCalcIndex - 1));
        event.preventDefault();
        break;
      case " ":
      case "Enter":
        newCalc = produce(props.calculations[props.activeCalcIndex], (draft) => {
          draft.enabled = !draft.enabled;
        });

        props.onPaletteChange(
          new PaletteAction({
            actionType: PaletteActionType.SetCalculation,
            args: { index: props.activeCalcIndex, calc: newCalc },
          })
        );
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
        refState={refState}
        onIndexChange={props.onIndexChange}
        onPaletteChange={props.onPaletteChange}
      />
    );
  }

  return (
    <>
      <div className="calculations-list">
        <div className="calculations-scroll" onKeyDown={handleKey} onMouseDown={handleClick} tabIndex={0}>
          <OverlayScrollbarsComponent options={{ scrollbars: { theme: "raised-scrollbar" } }} defer>
            <ul>{items}</ul>
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </>
  );
}

export type CalculationsViewProps = {
  useCalculations: boolean;
  calculations: readonly Calculation[];
  activeCalcIndex: number;
  onPaletteChange: React.Dispatch<PaletteAction>;
  onIndexChange: (index: number) => void;
};

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
