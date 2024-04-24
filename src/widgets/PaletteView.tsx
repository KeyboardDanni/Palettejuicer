import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { CelIndex, PALETTE_HEIGHT, PALETTE_WIDTH, Palette } from "../model/Palette";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../util/math";

type PaletteCelProps = {
  palette: Palette;
  index: CelIndex;
  active: boolean;
  scrubbing: boolean;
  onIndexClick: (index: CelIndex) => void;
};

function PaletteCel(props: PaletteCelProps) {
  const color = props.palette.color(props.index);
  const onIndexClick = props.onIndexClick;
  const handleClick = useCallback(
    function (event: React.MouseEvent) {
      if (event.buttons === 1) {
        onIndexClick(props.index);
      }
    },
    [props.index, onIndexClick]
  );
  const handleMouseEnter = useCallback(
    function (event: React.MouseEvent) {
      if (props.scrubbing && event.buttons === 1) {
        onIndexClick(props.index);
      }
    },
    [props.index, props.scrubbing, onIndexClick]
  );

  let className = "palette-cel";

  if (props.active) {
    className += " active-cel";

    if (color.lab.lightness > 50) {
      className += " light-color";
    } else {
      className += " dark-color";
    }
  }

  return (
    <>
      <div
        className={className}
        style={{ backgroundColor: color.rgb.hex }}
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
  scrubbing: boolean;
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
    row.push(
      <PaletteCel
        key={x}
        index={{ x: x, y: props.y }}
        palette={props.palette}
        active={active}
        scrubbing={props.scrubbing}
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
  active: CelIndex;
  onIndexChange: (index: CelIndex) => void;
};

export const PaletteView = memo(function (props: PaletteViewProps) {
  const [scrubbing, setScrubbing] = useState(false);
  const handleClick = useCallback(
    function () {
      setScrubbing(true);
    },
    [setScrubbing]
  );
  useEffect(() => {
    function unsetScrub() {
      setScrubbing(false);
    }

    document.addEventListener("mouseup", unsetScrub);

    return () => {
      document.removeEventListener("mouseup", unsetScrub);
    };
  }, [setScrubbing]);

  const onIndexChange = props.onIndexChange;
  const handleKey = useCallback(
    function (event: React.KeyboardEvent) {
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
        case "PageUp":
        case "PageDown":
        case "Home":
        case "End":
          event.preventDefault();
          break;
      }
    },
    [props.active, onIndexChange]
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
        onIndexClick={props.onIndexChange}
        scrubbing={scrubbing}
      />
    );
  }

  return (
    <>
      <div className="palette">
        <div className="palette-scroll" tabIndex={0} onKeyDown={handleKey} onMouseDown={handleClick}>
          <OverlayScrollbarsComponent defer>{rows}</OverlayScrollbarsComponent>
        </div>
      </div>
    </>
  );
});
