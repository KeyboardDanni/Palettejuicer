import { immerable, produce } from "immer";

import { Color } from "./color/Color";
import { ColorRgb } from "./color/ColorRgb";
import { Calculation } from "./calculation/Calculation";

// Fixed at 16x16 for now
export const PALETTE_WIDTH = 16;
export const PALETTE_HEIGHT = 16;

const DEFAULT_COLOR = Color.fromRgb(ColorRgb.from(60, 60, 60));

export interface CelIndex {
  x: number;
  y: number;
}

type NullableColor = Color | null;

export class Palette {
  [immerable] = true;

  readonly calculations: readonly Calculation[];
  readonly useCalculations: boolean = true;

  readonly selectedColors: readonly Color[];
  readonly computedColors: readonly NullableColor[];

  constructor() {
    this.calculations = [];
    this.selectedColors = new Array(PALETTE_WIDTH * PALETTE_HEIGHT).fill(null).map((_) => DEFAULT_COLOR);
    this.computedColors = new Array(PALETTE_WIDTH * PALETTE_HEIGHT).fill(null);
  }

  indexToOffset(index: CelIndex): number {
    if (index.x < 0 || index.x >= PALETTE_WIDTH || index.y < 0 || index.y >= PALETTE_HEIGHT) {
      throw new Error("Bad coordinates");
    }

    return index.y * PALETTE_WIDTH + index.x;
  }

  isOffsetComputed(offset: number): boolean {
    if (!this.useCalculations) {
      return false;
    }

    return this.computedColors[offset] !== null;
  }

  isComputed(index: CelIndex): boolean {
    const offset = this.indexToOffset(index);

    return this.isOffsetComputed(offset);
  }

  color(index: CelIndex): Color {
    const offset = this.indexToOffset(index);

    if (this.isOffsetComputed(offset)) {
      return this.computedColors[offset] as Color;
    }

    return this.selectedColors[offset];
  }

  selectedColor(index: CelIndex): Color {
    const offset = this.indexToOffset(index);

    return this.selectedColors[offset];
  }

  setSelectedColor(index: CelIndex, color: Color): Palette {
    const offset = this.indexToOffset(index);

    return produce(this, (draft) => {
      draft.selectedColors[offset] = color;
    });
  }

  updateComputedColors() {
    throw new Error("Not implemented");
  }
}
