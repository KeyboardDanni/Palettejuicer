import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { Palette } from "../model/Palette";

function paletteCel(props: PaletteViewProps, x: number, y: number) {
  const color = props.palette.color(x, y);
  let className = "palette-cel";

  if (props.index.x === x && props.index.y === y) {
    className += " active-cel";
  }

  function handleClick() {
    props.onIndexClicked(x, y);
  }

  return (
    <>
      <div className={className} style={{ backgroundColor: color.hex }} onMouseDown={handleClick} />
    </>
  );
}

function paletteRow(props: PaletteViewProps, y: number) {
  const row = [];

  for (let x = 0; x < 16; x++) {
    row.push(paletteCel(props, x, y));
  }

  return (
    <>
      <div className="palette-row">{row}</div>
    </>
  );
}

type PaletteViewProps = {
  palette: Palette;
  index: { x: number; y: number };
  onIndexClicked: (x: number, y: number) => void;
};

export function PaletteView(props: PaletteViewProps) {
  const rows = [];

  for (let y = 0; y < 16; y++) {
    rows.push(paletteRow(props, y));
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
