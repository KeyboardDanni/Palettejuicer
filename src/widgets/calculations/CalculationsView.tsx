import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Updater } from "use-immer";

import { Palette } from "../../model/Palette";
import { CalcGradient } from "../../model/calculation/CalcGradient";
import { clamp } from "../../util/math";
import { useEffect, useRef } from "react";

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

  const calcs = props.palette.calculations;
  const calculation = calcs[props.index];
  const className = props.active ? "active-calc" : "";
  const ref = useRef<HTMLLIElement>(null);

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

  const description = calculation.description();

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

export type CalculationsViewProps = {
  palette: Palette;
  activeCalcIndex: number;
  onPaletteChange: Updater<Palette>;
  onIndexChange: (index: number) => void;
};

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
      default:
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
  const prevIndex = clamp(props.activeCalcIndex - 1, 0, calcs.length);

  function handleAdd() {
    props.onPaletteChange((draft) => {
      draft.calculations.splice(nextIndex, 0, new CalcGradient());
    });

    props.onIndexChange(nextIndex);
  }

  function handleClone() {
    const cloned = calcs[props.activeCalcIndex].withNewUid();

    props.onPaletteChange((draft) => {
      draft.calculations.splice(nextIndex, 0, cloned);
    });

    props.onIndexChange(nextIndex);
  }

  function handleRemove() {
    props.onPaletteChange((draft) => {
      draft.calculations.splice(props.activeCalcIndex, 1);
    });

    const newIndex = clamp(props.activeCalcIndex, 0, calcs.length - 2);
    props.onIndexChange(newIndex);
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
        <button onClick={handleAdd}>Add</button>
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
