import { immerable, produce } from "immer";

import { Color } from "./color/Color";
import { ColorRgb } from "./color/ColorRgb";

// Fixed at 16x16 for now
const PALETTE_WIDTH = 16;
const PALETTE_HEIGHT = 16;

const DEFAULT_COLOR = Color.fromRgb(ColorRgb.from(60, 60, 60));

export class Palette {
  [immerable] = true;

  readonly selectedColors: Color[];

  constructor() {
    this.selectedColors = new Array(PALETTE_WIDTH * PALETTE_HEIGHT).fill(null).map((_) => DEFAULT_COLOR);
  }

  color(x: number, y: number): Color {
    return this.selectedColor(x, y);
  }

  selectedColor(x: number, y: number): Color {
    if (x < 0 || x >= PALETTE_WIDTH || y < 0 || y >= PALETTE_HEIGHT) {
      throw new Error("Bad coordinates");
    }

    return this.selectedColors[y * PALETTE_WIDTH + x];
  }

  setSelectedColor(x: number, y: number, color: Color): Palette {
    if (x < 0 || x >= PALETTE_WIDTH || y < 0 || y >= PALETTE_HEIGHT) {
      throw new Error("Bad coordinates");
    }

    return produce(this, (draft: this) => {
      draft.selectedColors[y * PALETTE_WIDTH + x] = color;
    });
  }
}
