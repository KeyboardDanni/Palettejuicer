import { ForwardedRef, forwardRef, memo, useCallback, useContext, useEffect, useRef, useState } from "react";
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
import { AppStateContext } from "../../contexts/AppStateContext";
import { GAMUT_ROUNDING_ERROR } from "../../model/color/Colorspace";
import { PaletteToolType, PaletteViewState } from "../../model/ProjectViewState";
import { OverlayScrollbars } from "overlayscrollbars";
import { clamp, pxToRem } from "../../util/math";

const PALETTE_CEL_SIZE_MIN = 2.2;
const PALETTE_CEL_SIZE_MAX = 9.6;

class PaletteViewRefState {
  scrubbing: boolean = false;
  lastScrubIndex: CelIndex | null = null;
}

type PaletteTopRulerProps = {
  columns: number;
  activeX: number;
  cursorX: number;
};

const PaletteTopRuler = forwardRef(function (props: PaletteTopRulerProps, ref: ForwardedRef<HTMLDivElement>) {
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
      <div ref={ref} className="palette-ruler-row">
        {row}
      </div>
    </>
  );
});

type PaletteLeftRulerProps = {
  rows: number;
  activeY: number;
  cursorY: number;
};

const PaletteLeftRuler = forwardRef(function (props: PaletteLeftRulerProps, ref: ForwardedRef<HTMLDivElement>) {
  const column = [];

  for (let y = 0; y < props.rows; y++) {
    let className = "palette-ruler-cel palette-ruler-column-cel";

    if (y === props.activeY) {
      className += " palette-ruler-active";
    } else if (y === props.cursorY) {
      className += " palette-ruler-cursor";
    }

    column.push(
      <div key={y} className={className}>
        {y}
      </div>
    );
  }

  return (
    <>
      <div ref={ref} className="palette-ruler-column">
        {column}
      </div>
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.cursor && navigator.userActivation.isActive) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [props.cursor]);

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
      ref={ref}
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
  onColorChange?: (index: CelIndex, color: Color) => void;
};

const PaletteRow = memo(function (props: PaletteRowProps) {
  const row = [];

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
      <div className="palette-row">{row}</div>
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

function updatePaletteCelSize(columns: number, rows: number, mainDiv: HTMLDivElement | null) {
  if (!mainDiv) return `${PALETTE_CEL_SIZE_MIN}rem`;

  const container = mainDiv.querySelector(".palette-container");
  const scroller = mainDiv.querySelector(".palette-scroll");
  const contents = mainDiv.querySelector("[data-overlayscrollbars-contents]");

  if (!container || !scroller || !contents) return "4rem";

  const containerStyle = getComputedStyle(container);
  const scrollerStyle = getComputedStyle(scroller);
  const contentsStyle = getComputedStyle(contents);

  const scrollbarWidth = pxToRem(contentsStyle.marginRight);
  const padding = pxToRem(scrollerStyle.padding);
  const containerWidth = pxToRem(containerStyle.width) - scrollbarWidth - padding * 2;
  const containerHeight = pxToRem(containerStyle.height) - scrollbarWidth - padding * 2;

  const maxWidth = Math.floor((containerWidth / columns) * 10) / 10;
  const maxHeight = Math.floor((containerHeight / rows) * 10) / 10;

  const size = clamp(Math.min(maxWidth, maxHeight), PALETTE_CEL_SIZE_MIN, PALETTE_CEL_SIZE_MAX);

  mainDiv.setAttribute("style", `--palette-cel-size: ${size}rem`);

  return `${size}rem`;
}

export type PaletteViewProps = {
  palette: Palette;
  onPaletteChange: React.Dispatch<PaletteAction>;
  viewState: PaletteViewState;
  onViewStateChange: Updater<PaletteViewState>;
  autoFocus?: boolean;
};

export const PaletteView = memo(function (props: PaletteViewProps) {
  const appState = useContext(AppStateContext);
  const clipboard = useContext(ClipboardContext);
  const celPicker = useContext(CelPickerContext);
  const setCelPicker = useContext(CelPickerSetterContext);
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const topRulerRef = useRef<HTMLDivElement>(null);
  const leftRulerRef = useRef<HTMLDivElement>(null);
  const refState = useRef(new PaletteViewRefState());

  const activeIndex = props.viewState.activeIndex;
  const cursorIndex = props.viewState.cursorIndex;
  const { onViewStateChange, onPaletteChange } = props;

  useEffect(() => {
    if (!mainRef.current || !scrollRef.current) return;

    const container = mainRef.current.querySelector(".palette-container");

    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updatePaletteCelSize(props.palette.width, props.palette.height, mainRef.current);
    });

    resizeObserver.observe(scrollRef.current);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [props.palette.width, props.palette.height]);

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
    if (props.autoFocus && celPicker && scrollRef) {
      scrollRef.current?.focus();
      setCursorIndex(celPicker.currentIndex);
    }
  }, [props.autoFocus, celPicker, scrollRef, setCursorIndex]);

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
      if (!refState.current.scrubbing || event.buttons !== 1) return;

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
        palette={props.palette}
        activeX={activeX}
        cursorX={cursorX}
        onColorChange={handleColorChange}
      />
    );
  }

  const onScroll = useCallback(
    function (event: OverlayScrollbars) {
      const target = event.elements().scrollOffsetElement;
      if (topRulerRef.current) {
        topRulerRef.current.scrollLeft = target.scrollLeft;
      }
      if (leftRulerRef.current) {
        leftRulerRef.current.scrollTop = target.scrollTop;
      }
    },
    [topRulerRef, leftRulerRef]
  );

  let className = "palette";

  if (celPicker) className += " cel-picker-active";
  if (appState.options.paletteRuler) className += " palette-ruler-active";

  return (
    <>
      <div ref={mainRef} className={className}>
        {appState.options.paletteRuler && (
          <>
            <div className="palette-ruler-corner"></div>
            <PaletteTopRuler
              ref={topRulerRef}
              columns={props.palette.width}
              activeX={activeIndex.x}
              cursorX={cursorIndex.x}
            />
            <PaletteLeftRuler
              ref={leftRulerRef}
              rows={props.palette.height}
              activeY={activeIndex.y}
              cursorY={cursorIndex.y}
            />
          </>
        )}
        <div className="palette-container">
          <div
            className="palette-scroll scroll-area-with-recess"
            ref={scrollRef}
            tabIndex={0}
            onKeyDown={handleKey}
            onMouseDown={handleClick}
            onMouseMove={handleMouseMove}
          >
            <OverlayScrollbarsComponent
              events={{ scroll: (e) => onScroll(e) }}
              options={{ scrollbars: { visibility: "visible", theme: "raised-scrollbar" } }}
              defer
            >
              {rows}
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </div>
    </>
  );
});
