import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { PopupActions } from "reactjs-popup/dist/types";

import { Palette } from "../../model/Palette";
import { CelIndex } from "../../util/cel";
import { ClipboardContext } from "../../contexts/ClipboardContext";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";
import { Color } from "../../model/color/Color";
import { PopupMenu, PopupMenuItem } from "../common/PopupMenu";
import { CelPickerContext, CelPickerSetterContext } from "../../contexts/CelPickerContext";
import { AppOptionsContext } from "../../contexts/AppOptionsContext";
import { GAMUT_ROUNDING_ERROR } from "../../model/color/Colorspace";

class PaletteViewRefState {
  scrubbing: boolean = false;
}

type PaletteTopRulerProps = {
  columns: number;
  activeX: number;
};

const PaletteTopRuler = memo(function (props: PaletteTopRulerProps) {
  const row = [];
  const className = "palette-ruler-cel palette-ruler-row-cel";

  for (let x = 0; x < props.columns; x++) {
    row.push(
      <div key={x} className={x === props.activeX ? className + " palette-ruler-active" : className}>
        {x}
      </div>
    );
  }

  return (
    <>
      <div className="palette-ruler-row">{row}</div>
    </>
  );
});

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
        {onColorChange && (
          <PopupMenuItem
            index={1}
            name="Paste"
            description={"Paste the color from the clipboard"}
            onItemSelect={handlePaste}
          />
        )}
      </PopupMenu>
    </>
  );
}

function paletteCelClassName(props: PaletteCelProps, gamutDistance: number) {
  let className = "palette-cel";

  if (props.active || gamutDistance > GAMUT_ROUNDING_ERROR) {
    if (props.color.lab.lightness ?? 0 > 50) {
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
  let description = props.index ? `Color cel [${props.index.x}, ${props.index.y}]\n` : "";
  description += props.color.data.describe();

  let cel = (
    <div
      className={className}
      style={{ backgroundColor: rgb.hex }}
      title={description}
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
  ruler: boolean;
  refState?: React.MutableRefObject<PaletteViewRefState>;
  onIndexClick: (index: CelIndex) => void;
  onColorChange?: (index: CelIndex, color: Color) => void;
};

const PaletteRow = memo(function (props: PaletteRowProps) {
  useEffect(() => {
    if (props.activeX !== null && navigator.userActivation.isActive) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [props.activeX]);

  const ref = useRef<HTMLDivElement>(null);
  const row = [];
  const className = "palette-ruler-cel palette-ruler-column-cel";

  if (props.ruler) {
    row.push(
      <div key={-1} className="palette-ruler-column">
        <div className={props.activeX !== null ? className + " palette-ruler-active" : className}>{props.y}</div>
      </div>
    );
  }

  for (let x = 0; x < props.palette.width; x++) {
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

export type PaletteViewProps = {
  palette: Palette;
  onPaletteChange: React.Dispatch<PaletteAction>;
  active: CelIndex;
  onIndexChange: (index: CelIndex) => void;
  autoFocus?: boolean;
};

export const PaletteView = memo(function (props: PaletteViewProps) {
  const appOptions = useContext(AppOptionsContext);
  const clipboard = useContext(ClipboardContext);
  const celPicker = useContext(CelPickerContext);
  const setCelPicker = useContext(CelPickerSetterContext);
  const ref = useRef<HTMLDivElement>(null);
  const refState = useRef(new PaletteViewRefState());

  const { onIndexChange, onPaletteChange } = props;

  useEffect(() => {
    if (props.autoFocus && celPicker && ref) {
      ref.current?.focus();
      onIndexChange(celPicker.currentIndex);
    }
  }, [props.autoFocus, celPicker, ref, onIndexChange]);

  const handleIndexClick = useCallback(
    function (index: CelIndex) {
      if (celPicker && setCelPicker) {
        celPicker.onAccept(index);
        celPicker.onReset();
        setCelPicker(null);
      }
      onIndexChange(index);
    },
    [celPicker, setCelPicker, onIndexChange]
  );

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
          onIndexChange(props.palette.clampIndex({ x: props.active.x - 1, y: props.active.y }));
          event.preventDefault();
          break;
        case "ArrowRight":
          onIndexChange(props.palette.clampIndex({ x: props.active.x + 1, y: props.active.y }));
          event.preventDefault();
          break;
        case "ArrowDown":
          onIndexChange(props.palette.clampIndex({ x: props.active.x, y: props.active.y + 1 }));
          event.preventDefault();
          break;
        case "ArrowUp":
          onIndexChange(props.palette.clampIndex({ x: props.active.x, y: props.active.y - 1 }));
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
        case "Enter":
          handleIndexClick(props.active);
          event.preventDefault();
          break;
        case "PageUp":
        case "PageDown":
        case "Home":
        case "End":
          event.preventDefault();
          break;
      }
    },
    [clipboard, props.active, props.palette, onIndexChange, handleColorChange, handleIndexClick]
  );

  const rows = [];

  for (let y = 0; y < props.palette.height; y++) {
    const activeX = y === props.active.y ? props.active.x : null;
    rows.push(
      <PaletteRow
        key={y}
        y={y}
        ruler={appOptions.paletteRuler}
        palette={props.palette}
        activeX={activeX}
        onIndexClick={handleIndexClick}
        onColorChange={handleColorChange}
        refState={refState}
      />
    );
  }

  return (
    <>
      {appOptions.paletteRuler && <PaletteTopRuler columns={props.palette.width} activeX={props.active.x} />}
      <div className={celPicker ? "palette cel-picker-active" : "palette"}>
        <div
          className={appOptions.paletteRuler ? "palette-scroll palette-scroll-ruler" : "palette-scroll"}
          ref={ref}
          tabIndex={0}
          onKeyDown={handleKey}
          onMouseDown={handleClick}
        >
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
