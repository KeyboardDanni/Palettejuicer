import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Updater } from "use-immer";
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
import { PaletteToolType, PaletteViewState } from "../../model/AppViewState";

class PaletteViewRefState {
  scrubbing: boolean = false;
  lastScrubIndex: CelIndex | null = null;
}

type PaletteTopRulerProps = {
  columns: number;
  activeX: number;
  cursorX: number;
};

const PaletteTopRuler = memo(function (props: PaletteTopRulerProps) {
  const row = [];

  for (let x = 0; x < props.columns; x++) {
    let className = "palette-ruler-cel palette-ruler-row-cel";

    if (x === props.activeX) {
      className += " palette-ruler-active";
    } else if (x === props.cursorX) {
      className += " palette-ruler-cursor";
    }

    row.push(
      <div key={x} className={className}>
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
  cursor?: boolean;
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

  if (props.active || props.cursor || gamutDistance > GAMUT_ROUNDING_ERROR) {
    if ((props.color.lab.lightness ?? 0) > 50) {
      className += " light-color";
    } else {
      className += " dark-color";
    }
  }

  if (props.active) {
    className += " active-cel";
  } else if (props.cursor) {
    className += " cursor-cel";
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

  const handleClick = useCallback(
    function (event: React.MouseEvent) {
      if (event.buttons === 1) {
        popupRef.current?.close();
      }
    },
    [popupRef]
  );

  const handleContextMenu = useCallback(
    function (event: React.MouseEvent) {
      setPopupOpen(true);
      event.preventDefault();
    },
    [setPopupOpen]
  );

  const rgb = props.color.rgb;
  const gamutDistance = rgb.outOfGamutDistance();

  const className = paletteCelClassName(props, gamutDistance);
  let description = props.index ? `Color cel [${props.index.x}, ${props.index.y}]\n` : "";
  description += props.color.data.describe();

  let cel = (
    <div
      data-cel-index={props.index ? [props.index.x, props.index.y] : undefined}
      className={className}
      style={{ backgroundColor: rgb.hex }}
      title={description}
      onMouseDown={handleClick}
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
  cursorX: number | null;
  ruler: boolean;
  onColorChange?: (index: CelIndex, color: Color) => void;
};

const PaletteRow = memo(function (props: PaletteRowProps) {
  useEffect(() => {
    if (props.cursorX !== null && navigator.userActivation.isActive) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [props.cursorX]);

  const ref = useRef<HTMLDivElement>(null);
  const row = [];
  let className = "palette-ruler-cel palette-ruler-column-cel";

  if (props.activeX !== null) {
    className += " palette-ruler-active";
  } else if (props.cursorX !== null) {
    className += " palette-ruler-cursor";
  }

  if (props.ruler) {
    row.push(
      <div key={-1} className="palette-ruler-column">
        <div className={className}>{props.y}</div>
      </div>
    );
  }

  for (let x = 0; x < props.palette.width; x++) {
    const active = x === props.activeX;
    const cursor = x === props.cursorX;
    const index = { x: x, y: props.y };
    row.push(
      <PaletteCel
        key={x}
        index={index}
        color={props.palette.color(index)}
        active={active}
        cursor={cursor}
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

function indexForClickEvent(event: React.MouseEvent): CelIndex | null {
  const elements = document.elementsFromPoint(event.clientX, event.clientY);

  for (const element of elements) {
    if (element.classList.contains("palette-cel")) {
      const indexData = element
        .getAttribute("data-cel-index")
        ?.split(",")
        ?.map((value) => parseInt(value));

      if (indexData) {
        return { x: indexData[0], y: indexData[1] };
      }
    }
  }

  return null;
}

export type PaletteViewProps = {
  palette: Palette;
  onPaletteChange: React.Dispatch<PaletteAction>;
  viewState: PaletteViewState;
  onViewStateChange: Updater<PaletteViewState>;
  autoFocus?: boolean;
};

export const PaletteView = memo(function (props: PaletteViewProps) {
  const appOptions = useContext(AppOptionsContext);
  const clipboard = useContext(ClipboardContext);
  const celPicker = useContext(CelPickerContext);
  const setCelPicker = useContext(CelPickerSetterContext);
  const ref = useRef<HTMLDivElement>(null);
  const refState = useRef(new PaletteViewRefState());

  const activeIndex = props.viewState.activeIndex;
  const cursorIndex = props.viewState.cursorIndex;
  const { onViewStateChange, onPaletteChange } = props;

  const setCursorIndex = useCallback(
    function (index: CelIndex, active?: boolean) {
      onViewStateChange((draft) => {
        draft.cursorIndex = index;

        if (active) {
          draft.activeIndex = index;
        }
      });
    },
    [onViewStateChange]
  );

  const moveIndex = useCallback(
    function (index: CelIndex) {
      onViewStateChange((draft) => {
        draft.cursorIndex = index;

        if (props.viewState.tool === PaletteToolType.Select) {
          draft.activeIndex = index;
        }
      });
    },
    [props.viewState, onViewStateChange]
  );

  useEffect(() => {
    if (props.autoFocus && celPicker && ref) {
      ref.current?.focus();
      setCursorIndex(celPicker.currentIndex);
    }
  }, [props.autoFocus, celPicker, ref, setCursorIndex]);

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

  const handleIndexClick = useCallback(
    function (index: CelIndex) {
      setCursorIndex(index, props.viewState.tool === PaletteToolType.Select);

      if (celPicker && setCelPicker) {
        celPicker.onAccept(index);
        celPicker.onReset();
        setCelPicker(null);
      } else {
        switch (props.viewState.tool) {
          case PaletteToolType.Paint:
            if (!props.palette.isComputed(index)) {
              handleColorChange(index, props.palette.color(activeIndex));
            }
            break;
          case PaletteToolType.FloodFill:
            if (!props.palette.isComputed(index)) {
              onPaletteChange(
                new PaletteAction({
                  actionType: PaletteActionType.FloodFillBaseColor,
                  args: { index, color: props.palette.color(activeIndex) },
                })
              );
            }
            break;
        }
      }
    },
    [
      props.viewState.tool,
      activeIndex,
      props.palette,
      handleColorChange,
      onPaletteChange,
      celPicker,
      setCelPicker,
      setCursorIndex,
    ]
  );

  const handleClick = useCallback(
    function (event: React.MouseEvent) {
      const elements = document.elementsFromPoint(event.clientX, event.clientY);

      for (const element of elements) {
        if (element.classList.contains("os-scrollbar-handle")) {
          return;
        }
      }

      const index = indexForClickEvent(event);

      if (index) {
        refState.current.scrubbing = true;
        refState.current.lastScrubIndex = { ...index };

        handleIndexClick(index);
      }
    },
    [refState, handleIndexClick]
  );

  const handleMouseMove = useCallback(
    function (event: React.MouseEvent) {
      if (!refState.current.scrubbing) return;

      const last = refState.current.lastScrubIndex;
      const index = indexForClickEvent(event);

      if (index && (!last || last.x !== index.x || last.y !== index.y)) {
        refState.current.lastScrubIndex = { ...index };
        handleIndexClick(index);
      }
    },
    [refState, handleIndexClick]
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

  const handleKey = useCallback(
    async function (event: React.KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft":
          moveIndex(props.palette.clampIndex({ x: cursorIndex.x - 1, y: cursorIndex.y }));
          event.preventDefault();
          break;
        case "ArrowRight":
          moveIndex(props.palette.clampIndex({ x: cursorIndex.x + 1, y: cursorIndex.y }));
          event.preventDefault();
          break;
        case "ArrowDown":
          moveIndex(props.palette.clampIndex({ x: cursorIndex.x, y: cursorIndex.y + 1 }));
          event.preventDefault();
          break;
        case "ArrowUp":
          moveIndex(props.palette.clampIndex({ x: cursorIndex.x, y: cursorIndex.y - 1 }));
          event.preventDefault();
          break;
        case "c":
          if (event.ctrlKey) {
            clipboard.copy(props.palette.color(cursorIndex));
            event.preventDefault();
          }
          break;
        case "v":
          if (event.ctrlKey) {
            const color = await clipboard.paste();

            if (color !== null) {
              handleColorChange(cursorIndex, color);
            }

            event.preventDefault();
          }
          break;
        case " ":
        case "Enter":
          handleIndexClick(cursorIndex);
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
    [clipboard, props.palette, cursorIndex, moveIndex, handleColorChange, handleIndexClick]
  );

  const rows = [];

  for (let y = 0; y < props.palette.height; y++) {
    const activeX = y === activeIndex.y ? activeIndex.x : null;
    const cursorX = y === cursorIndex.y ? cursorIndex.x : null;
    rows.push(
      <PaletteRow
        key={y}
        y={y}
        ruler={appOptions.paletteRuler}
        palette={props.palette}
        activeX={activeX}
        cursorX={cursorX}
        onColorChange={handleColorChange}
      />
    );
  }

  return (
    <>
      {appOptions.paletteRuler && (
        <PaletteTopRuler columns={props.palette.width} activeX={activeIndex.x} cursorX={cursorIndex.x} />
      )}
      <div className={celPicker ? "palette cel-picker-active" : "palette"}>
        <div
          className={appOptions.paletteRuler ? "palette-scroll palette-scroll-ruler" : "palette-scroll"}
          ref={ref}
          tabIndex={0}
          onKeyDown={handleKey}
          onMouseDown={handleClick}
          onMouseMove={handleMouseMove}
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
