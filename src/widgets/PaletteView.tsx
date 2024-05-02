import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { PALETTE_HEIGHT, PALETTE_WIDTH, Palette } from "../model/Palette";
import { CelIndex } from "../util/cel";
import { memo, useCallback, useContext, useEffect, useRef } from "react";
import { clamp } from "../util/math";
import { ClipboardContext } from "../contexts/ClipboardContext";
import { PaletteAction, PaletteActionType } from "../reducers/PaletteReducer";
import { Color } from "../model/color/Color";
import { GAMUT_ROUNDING_ERROR } from "../model/color/ColorspaceRgb";

class PaletteViewRefState {
  scrubbing: boolean = false;
}

export type PaletteCelProps = {
  color: Color;
  index?: CelIndex;
  active?: boolean;
  refState?: React.MutableRefObject<PaletteViewRefState>;
  onIndexClick?: (index: CelIndex) => void;
};

export function PaletteCel(props: PaletteCelProps) {
  const onIndexClick = props.onIndexClick;
  const handleClick = useCallback(
    function (event: React.MouseEvent) {
      if (onIndexClick && props.index !== undefined && event.buttons === 1) {
        onIndexClick(props.index);
      }
    },
    [props.index, onIndexClick]
  );
  const handleMouseEnter = useCallback(
    function (event: React.MouseEvent) {
      if (onIndexClick && props.index !== undefined && props.refState?.current.scrubbing && event.buttons === 1) {
        onIndexClick(props.index);
      }
    },
    [props.index, props.refState, onIndexClick]
  );

  let className = "palette-cel";
  const rgb = props.color.rgb;
  const gamutDistance = rgb.outOfGamutDistance();

  if (props.active || gamutDistance > GAMUT_ROUNDING_ERROR) {
    if (props.color.lab.lightness > 50) {
      className += " light-color";
    } else {
      className += " dark-color";
    }
  }

  if (props.active) {
    className += " active-cel";
  }

  if (gamutDistance > GAMUT_ROUNDING_ERROR) {
    className += " out-of-gamut";

    if (gamutDistance > 0.2) {
      className += " really-out-of-gamut";
    }
  }

  return (
    <>
      <div
        className={className}
        style={{ backgroundColor: rgb.hex }}
        title={props.color.data.describe()}
        onMouseDown={handleClick}
        onMouseEnter={handleMouseEnter}
      />
    </>
  );
}

type PaletteRowProps = {
  palette: Palette;
  y: number;
  activeX: number | null;
  refState?: React.MutableRefObject<PaletteViewRefState>;
  onIndexClick: (index: CelIndex) => void;
};

const PaletteRow = memo(function (props: PaletteRowProps) {
  useEffect(() => {
    if (props.activeX !== null) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [props.activeX]);
  const ref = useRef<HTMLDivElement>(null);
  const row = [];

  for (let x = 0; x < PALETTE_WIDTH; x++) {
    const active = x === props.activeX;
    const index = { x: x, y: props.y };
    row.push(
      <PaletteCel
        key={x}
        index={index}
        color={props.palette.color(index)}
        active={active}
        refState={props.refState}
        onIndexClick={props.onIndexClick}
      />
    );
  }

  return (
    <>
      <div className="palette-row" ref={ref}>
        {row}
      </div>
    </>
  );
});

function clampIndex(index: CelIndex): CelIndex {
  return {
    x: clamp(index.x, 0, PALETTE_WIDTH - 1),
    y: clamp(index.y, 0, PALETTE_HEIGHT - 1),
  };
}

export type PaletteViewProps = {
  palette: Palette;
  onPaletteChange: React.Dispatch<PaletteAction>;
  active: CelIndex;
  onIndexChange: (index: CelIndex) => void;
};

export const PaletteView = memo(function (props: PaletteViewProps) {
  const clipboard = useContext(ClipboardContext);
  const refState = useRef(new PaletteViewRefState());
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

  const { onIndexChange, onPaletteChange } = props;
  const handleKey = useCallback(
    async function (event: React.KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft":
          onIndexChange(clampIndex({ x: props.active.x - 1, y: props.active.y }));
          event.preventDefault();
          break;
        case "ArrowRight":
          onIndexChange(clampIndex({ x: props.active.x + 1, y: props.active.y }));
          event.preventDefault();
          break;
        case "ArrowDown":
          onIndexChange(clampIndex({ x: props.active.x, y: props.active.y + 1 }));
          event.preventDefault();
          break;
        case "ArrowUp":
          onIndexChange(clampIndex({ x: props.active.x, y: props.active.y - 1 }));
          event.preventDefault();
          break;
        case "c":
          if (event.ctrlKey) {
            clipboard.copy(props.palette.color(props.active));
            event.preventDefault();
          }
          break;
        case "v":
          if (event.ctrlKey) {
            const color = await clipboard.paste();

            if (color !== null) {
              onPaletteChange(
                new PaletteAction({
                  actionType: PaletteActionType.SetBaseColor,
                  args: { index: props.active, color },
                })
              );
            }

            event.preventDefault();
          }
          break;
        case "PageUp":
        case "PageDown":
        case "Home":
        case "End":
          event.preventDefault();
          break;
      }
    },
    [clipboard, props.active, props.palette, onIndexChange, onPaletteChange]
  );
  const rows = [];

  for (let y = 0; y < PALETTE_HEIGHT; y++) {
    const activeX = y === props.active.y ? props.active.x : null;
    rows.push(
      <PaletteRow
        key={y}
        y={y}
        palette={props.palette}
        activeX={activeX}
        onIndexClick={onIndexChange}
        refState={refState}
      />
    );
  }

  return (
    <>
      <div className="palette">
        <div className="palette-scroll" tabIndex={0} onKeyDown={handleKey} onMouseDown={handleClick}>
          <OverlayScrollbarsComponent
            options={{ overflow: { x: "hidden", y: "scroll" }, scrollbars: { theme: "raised-scrollbar" } }}
            defer
          >
            {rows}
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </>
  );
});
