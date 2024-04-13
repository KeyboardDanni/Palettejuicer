import React, { useEffect, useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import { Updater } from "use-immer";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { Palette } from "../../model/Palette";
import { Calculation } from "../../model/calculation/Calculation";
import { CalcInterpolateStrip } from "../../model/calculation/CalcInterpolateStrip";
import { clamp } from "../../util/math";

const AVAILABLE_CALCS = [CalcInterpolateStrip];

type AddCalculationMenuItemProps = {
  palette: Palette;
  calcClass: typeof Calculation;
  itemId: number;
  nextIndex: number;
  popupRef: React.RefObject<PopupActions>;
  onPaletteChange: Updater<Palette>;
  onIndexChange: (index: number) => void;
};

function AddCalculationMenuItem(props: AddCalculationMenuItemProps) {
  function handleKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        handleAdd();
        break;
    }
  }

  function handleAdd() {
    props.onPaletteChange((draft) => {
      // @ts-expect-error No way to tell tsc that this won't be abstract, and we need more than the new() function
      draft.calculations.splice(props.nextIndex, 0, new props.calcClass());
    });

    props.onIndexChange(props.nextIndex);
    props.popupRef.current?.close();
  }

  return (
    <>
      <li data-id={props.itemId} tabIndex={0} onMouseUp={handleAdd} onKeyDown={handleKey}>
        <div title={props.calcClass.description()}>{props.calcClass.name()}</div>
      </li>
    </>
  );
}

export type CalculationsViewProps = {
  palette: Palette;
  activeCalcIndex: number;
  onPaletteChange: Updater<Palette>;
  onIndexChange: (index: number) => void;
};

function AddCalculationMenu(props: CalculationsViewProps) {
  const ref = useRef<HTMLUListElement>(null);
  const popupRef = useRef<PopupActions>(null);
  const nextIndex = Math.min(props.activeCalcIndex + 1, props.palette.calculations.length);
  const calcClasses: JSX.Element[] = [];

  for (const [id, calcClass] of AVAILABLE_CALCS.entries()) {
    calcClasses.push(
      <AddCalculationMenuItem
        key={calcClass.name()}
        palette={props.palette}
        calcClass={calcClass}
        nextIndex={nextIndex}
        onPaletteChange={props.onPaletteChange}
        onIndexChange={props.onIndexChange}
        popupRef={popupRef}
        itemId={id}
      />
    );
  }

  function addButton(isOpen: boolean): JSX.Element {
    const className = isOpen ? "selected" : "";

    return <button className={className}>Add</button>;
  }

  function handleKey(event: React.KeyboardEvent) {
    if (!ref.current) {
      return;
    }

    const currentId = parseInt((event.target as HTMLElement).dataset["id"] ?? "0");
    const items = ref.current.children;

    switch (event.key) {
      case "ArrowUp":
        (items[Math.max(0, currentId - 1)] as HTMLElement).focus();
        event.preventDefault();
        break;
      case "ArrowDown":
        (items[Math.min(currentId + 1, items.length - 1)] as HTMLElement).focus();
        event.preventDefault();
        break;
    }
  }

  return (
    <>
      <Popup trigger={addButton} ref={popupRef} position="bottom left" arrow={false}>
        <div className="popup">
          <div className="menu" onKeyDown={handleKey}>
            <ul ref={ref}>{calcClasses}</ul>
          </div>
        </div>
      </Popup>
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
    if (calcs.length <= 0) return;

    const cloned = calcs[props.activeCalcIndex].withNewUid();

    props.onPaletteChange((draft) => {
      draft.calculations.splice(nextIndex, 0, cloned);
    });

    props.onIndexChange(nextIndex);
  }

  function handleRemove() {
    if (calcs.length <= 0) return;

    props.onPaletteChange((draft) => {
      draft.calculations.splice(props.activeCalcIndex, 1);
    });

    props.onIndexChange(prevIndex);
  }

  function handleMoveUp() {
    if (props.activeCalcIndex === 0) return;

    props.onPaletteChange((draft) => {
      const [popped] = draft.calculations.splice(props.activeCalcIndex, 1);
      draft.calculations.splice(prevIndex, 0, popped);
    });

    props.onIndexChange(prevIndex);
  }

  function handleMoveDown() {
    if (props.activeCalcIndex >= calcs.length - 1) return;

    props.onPaletteChange((draft) => {
      const [popped] = draft.calculations.splice(props.activeCalcIndex, 1);
      draft.calculations.splice(nextIndex, 0, popped);
    });

    const newIndex = clamp(props.activeCalcIndex + 1, 0, calcs.length - 1);
    props.onIndexChange(newIndex);
  }

  return (
    <>
      <div className="button-bar">
        <AddCalculationMenu {...props} />
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
