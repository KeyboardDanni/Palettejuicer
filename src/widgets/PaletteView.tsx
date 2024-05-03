import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { PopupActions } from "reactjs-popup/dist/types";

import { PALETTE_HEIGHT, PALETTE_WIDTH, Palette } from "../model/Palette";
import { CelIndex } from "../util/cel";
import { clamp } from "../util/math";
import { ClipboardContext } from "../contexts/ClipboardContext";
import { PaletteAction, PaletteActionType } from "../reducers/PaletteReducer";
import { Color } from "../model/color/Color";
import { GAMUT_ROUNDING_ERROR } from "../model/color/ColorspaceRgb";
import { PopupMenu, PopupMenuItem } from "./common/PopupMenu";

class PaletteViewRefState {
  scrubbing: boolean = false;
}

export type PaletteCelProps = {
  color: Color;
  index?: CelIndex;
  active?: boolean;
  refState?: React.MutableRefObject<PaletteViewRefState>;
  onIndexClick?: (index: CelIndex) => void;
  onColorChange?: (index: CelIndex, color: Color) => void;
};

export type PaletteCelMenuProps = PaletteCelProps & {
  cel: JSX.Element;
  onClose: () => void;
};

function PaletteCelMenu(props: PaletteCelMenuProps) {
  const clipboard = useContext(ClipboardContext);
  const popupRef = useRef<PopupActions>(null);
  const onColorChange = props.onColorChange;

  const handleCopy = useCallback(
    async function () {
      await clipboard.copy(props.color);
      popupRef.current?.close();
    },
    [clipboard, props.color, popupRef]
  );

  const handlePaste = useCallback(
    async function () {
      const color = await clipboard.paste();

      if (onColorChange && props.index && color !== null) {
        onColorChange(props.index, color);
      }

      popupRef.current?.close();
    },
    [props.index, clipboard, popupRef, onColorChange]
  );

  let paste = null;

  if (onColorChange) {
    paste = (
      <PopupMenuItem
        index={1}
        name="Paste"
        description={"Paste the color from the clipboard"}
        onItemSelect={handlePaste}
      />
    );
  }

  return (
    <>
      <PopupMenu
        button={props.cel}
        on={["click", "right-click"]}
        open={true}
        onClose={props.onClose}
        popupRef={popupRef}
      >
        <PopupMenuItem
          index={0}
          name="Copy"
          description={"Copy the color to the clipboard"}
          onItemSelect={handleCopy}
        />
        {paste}
      </PopupMenu>
    </>
  );
}

function paletteCelClassName(props: PaletteCelProps, gamutDistance: number) {
  let className = "palette-cel";

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
  return className;
}

export function PaletteCel(props: PaletteCelProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef<PopupActions>(null);
  const onIndexClick = props.onIndexClick;

  const handleClick = useCallback(
    function (event: React.MouseEvent) {
      if (onIndexClick && props.index !== undefined && event.buttons === 1) {
        onIndexClick(props.index);
        popupRef.current?.close();
      }
    },
    [props.index, popupRef, onIndexClick]
  );

  const handleMouseEnter = useCallback(
    function (event: React.MouseEvent) {
      if (onIndexClick && props.index !== undefined && props.refState?.current.scrubbing && event.buttons === 1) {
        onIndexClick(props.index);
      }
    },
    [props.index, props.refState, onIndexClick]
  );

  const handleContextMenu = useCallback(
    function (event: React.MouseEvent) {
      setPopupOpen(true);
      if (onIndexClick && props.index !== undefined) {
        onIndexClick(props.index);
      }
      event.preventDefault();
    },
    [props.index, setPopupOpen, onIndexClick]
  );

  const rgb = props.color.rgb;
  const gamutDistance = rgb.outOfGamutDistance();

  const className = paletteCelClassName(props, gamutDistance);

  let cel = (
    <div
      className={className}
      style={{ backgroundColor: rgb.hex }}
      title={props.color.data.describe()}
      onMouseDown={handleClick}
      onMouseEnter={handleMouseEnter}
      onContextMenu={handleContextMenu}
    />
  );

  if (popupOpen) {
    cel = <PaletteCelMenu cel={cel} onClose={() => setPopupOpen(false)} {...props} />;
  }

  return <>{cel}</>;
}

type PaletteRowProps = {
  palette: Palette;
  y: number;
  activeX: number | null;
  refState?: React.MutableRefObject<PaletteViewRefState>;
  onIndexClick: (index: CelIndex) => void;
  onColorChange?: (index: CelIndex, color: Color) => void;
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
        onColorChange={props.onColorChange}
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

  const handleColorChange = useCallback(
    function (index: CelIndex, color: Color) {
      onPaletteChange(
        new PaletteAction({
          actionType: PaletteActionType.SetBaseColor,
          args: { index, color },
        })
      );
    },
    [onPaletteChange]
  );

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
              handleColorChange(props.active, color);
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
    [clipboard, props.active, props.palette, onIndexChange, handleColorChange]
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
        onColorChange={handleColorChange}
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
