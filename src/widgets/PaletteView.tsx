import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { Palette } from "../model/Palette";

type PaletteCelProps = {
  palette: Palette;
  index: { x: number; y: number };
  active: boolean;
  onIndexClicked: (x: number, y: number) => void;
};

function PaletteCel(props: PaletteCelProps) {
  const color = props.palette.color(props.index.x, props.index.y);
  let className = "palette-cel";

  if (props.active) {
    className += " active-cel";

    if (color.labch.lightness > 50) {
      className += " light-color";
    } else {
      className += " dark-color";
    }
  }

  function handleClick() {
    props.onIndexClicked(props.index.x, props.index.y);
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
  onIndexClicked: (x: number, y: number) => void;
};

function PaletteRow(props: PaletteRowProps) {
  const row = [];

  for (let x = 0; x < 16; x++) {
    const active = x === props.activeX;
    row.push(
      <PaletteCel
        key={x}
        index={{ x: x, y: props.y }}
        palette={props.palette}
        active={active}
        onIndexClicked={props.onIndexClicked}
      />
    );
  }

  return (
    <>
      <div className="palette-row">{row}</div>
    </>
  );
}

type PaletteViewProps = {
  palette: Palette;
  active: { x: number; y: number };
  onIndexClicked: (x: number, y: number) => void;
};

export function PaletteView(props: PaletteViewProps) {
  const rows = [];

  for (let y = 0; y < 16; y++) {
    const activeX = y === props.active.y ? props.active.x : null;
    rows.push(
      <PaletteRow key={y} y={y} palette={props.palette} activeX={activeX} onIndexClicked={props.onIndexClicked} />
    );
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
}
