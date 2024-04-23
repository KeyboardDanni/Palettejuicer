import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { CelIndex, PALETTE_HEIGHT, PALETTE_WIDTH, Palette } from "../model/Palette";
import { memo, useCallback } from "react";

type PaletteCelProps = {
  palette: Palette;
  index: CelIndex;
  active: boolean;
  onIndexClick: (index: CelIndex) => void;
};

function PaletteCel(props: PaletteCelProps) {
  const color = props.palette.color(props.index);
  const onIndexClick = props.onIndexClick;
  const handleClick = useCallback(
    function () {
      onIndexClick(props.index);
    },
    [props.index, onIndexClick]
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
      <div className={className} style={{ backgroundColor: color.rgb.hex }} onMouseDown={handleClick} />
    </>
  );
}

type PaletteRowProps = {
  palette: Palette;
  y: number;
  activeX: number | null;
  onIndexClick: (index: CelIndex) => void;
};

const PaletteRow = memo(function (props: PaletteRowProps) {
  const row = [];

  for (let x = 0; x < PALETTE_WIDTH; x++) {
    const active = x === props.activeX;
    row.push(
      <PaletteCel
        key={x}
        index={{ x: x, y: props.y }}
        palette={props.palette}
        active={active}
        onIndexClick={props.onIndexClick}
      />
    );
  }

  return (
    <>
      <div className="palette-row">{row}</div>
    </>
  );
});

export type PaletteViewProps = {
  palette: Palette;
  active: CelIndex;
  onIndexClick: (index: CelIndex) => void;
};

export const PaletteView = memo(function (props: PaletteViewProps) {
  const rows = [];

  for (let y = 0; y < PALETTE_HEIGHT; y++) {
    const activeX = y === props.active.y ? props.active.x : null;
    rows.push(<PaletteRow key={y} y={y} palette={props.palette} activeX={activeX} onIndexClick={props.onIndexClick} />);
  }

  return (
    <>
      <div className="palette">
        <div className="palette-scroll">
          <OverlayScrollbarsComponent defer>{rows}</OverlayScrollbarsComponent>
        </div>
      </div>
    </>
  );
});
