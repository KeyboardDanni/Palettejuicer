import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

function paletteCel(x: number, y: number) {
  
  return (
    <>
      <div className="palette-cel" style={{backgroundColor: `rgb(${x * 8} ${(x + y) * 4} ${y * 8})`}} />
    </>
  )
}

function paletteRow(y: number) {
  const row = [];

  for (let x = 0; x < 16; x++) {
    row.push(paletteCel(x, y));
  }

  return (
    <>
      <div className="palette-row">
        {row}
      </div>
    </>
  )
}

function Palette() {
  const rows = [];

  for (let y = 0; y < 16; y++) {
    rows.push(paletteRow(y));
  }

  return (
    <>
      <div className="palette">
        <div className="palette-scroll">
          <OverlayScrollbarsComponent defer>
            {rows}
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </>
  )
}

export default Palette;
