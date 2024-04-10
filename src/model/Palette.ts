import Color from "./color/Color";
import { ColorRgb } from "./color/ColorRgb";

// Fixed at 16x16 for now
const PALETTE_WIDTH = 16;
const PALETTE_HEIGHT = 16;

const DEFAULT_COLOR = Color.fromRgb(ColorRgb.from(64, 64, 64));

class Palette {
  private _selectedColors: Color[];

  constructor() {
    this._selectedColors = new Array(PALETTE_WIDTH * PALETTE_HEIGHT).fill(null).map((_) => DEFAULT_COLOR.clone());
  }

  clone(): Palette {
    const newPalette = new Palette();

    newPalette._selectedColors = this._selectedColors.map((color) => color.clone());

    return newPalette;
  }

  color(x: number, y: number): Color {
    return this.selectedColor(x, y);
  }

  selectedColor(x: number, y: number): Color {
    if (x < 0 || x >= PALETTE_WIDTH || y < 0 || y >= PALETTE_HEIGHT) {
      throw new Error("Bad coordinates");
    }

    return this._selectedColors[y * PALETTE_WIDTH + x];
  }

  setSelectedColor(x: number, y: number, color: Color): Palette {
    if (x < 0 || x >= PALETTE_WIDTH || y < 0 || y >= PALETTE_HEIGHT) {
      throw new Error("Bad coordinates");
    }

    const newPalette = this.clone();

    newPalette._selectedColors[y * PALETTE_WIDTH + x] = color;

    return newPalette;
  }
}

export default Palette;
