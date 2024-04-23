import { immerable } from "immer";
import { Type } from "class-transformer";

import { Color } from "./color/Color";
import { ColorspaceRgb } from "./color/ColorspaceRgb";
import { Calculation } from "./calculation/Calculation";
import { throwOnNullIndex } from "../util/checks";

import { CalcCopyColors } from "./calculation/CalcCopyColors";
import { CalcInterpolateStrip } from "./calculation/CalcInterpolateStrip";

type AvailableCalcItem = {
  value: typeof Calculation;
  name: string;
};

export const availableCalcs: AvailableCalcItem[] = [
  { value: CalcCopyColors, name: "CalcCopyColors" },
  { value: CalcInterpolateStrip, name: "CalcInterpolateStrip" },
];

// Fixed at 16x16 for now
export const PALETTE_WIDTH = 16;
export const PALETTE_HEIGHT = 16;

const DEFAULT_COLOR = new Color(new ColorspaceRgb().withTransformed(60, 60, 60));

export interface CelIndex {
  x: number;
  y: number;
}

type NullableColor = Color | null;

export class Palette {
  [immerable] = true;

  @Type(() => Calculation, {
    discriminator: {
      property: "calcType",
      subTypes: availableCalcs as any,
    },
  })
  readonly calculations: readonly Calculation[];
  readonly useCalculations: boolean = true;

  @Type(() => Color)
  readonly baseColors: readonly Color[];
  @Type(() => Color)
  readonly computedColors: readonly NullableColor[];

  constructor() {
    this.calculations = [];
    this.baseColors = new Array(PALETTE_WIDTH * PALETTE_HEIGHT).fill(null).map((_) => DEFAULT_COLOR);
    this.computedColors = new Array(PALETTE_WIDTH * PALETTE_HEIGHT).fill(null);
  }

  indexToOffset(index: CelIndex): number | null {
    if (index.x < 0 || index.x >= PALETTE_WIDTH || index.y < 0 || index.y >= PALETTE_HEIGHT) {
      return null;
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

    if (offset === null) return false;

    return this.isOffsetComputed(offset);
  }

  color(index: CelIndex): Color {
    const offset = throwOnNullIndex(this.indexToOffset(index));

    if (this.isOffsetComputed(offset)) {
      return this.computedColors[offset] as Color;
    }

    return this.baseColors[offset];
  }

  baseColor(index: CelIndex): Color {
    const offset = throwOnNullIndex(this.indexToOffset(index));

    return this.baseColors[offset];
  }

  computeColors(): NullableColor[] {
    const computedColors = new Array(PALETTE_WIDTH * PALETTE_HEIGHT).fill(null);

    const getTempColor = (index: CelIndex): Color => {
      const offset = throwOnNullIndex(this.indexToOffset(index));

      return computedColors[offset] ?? this.baseColors[offset];
    };

    for (const calc of this.calculations) {
      try {
        const inputIndexes = calc.inputCels();
        const colors = inputIndexes.map((index) => getTempColor(index));

        const result = calc.computeColors(colors);

        for (const cel of result.cels) {
          const offset = this.indexToOffset(cel.index);

          if (offset !== null) {
            computedColors[offset] = cel.color;
          }
        }
      } catch (error) {
        // TODO better error handling
        console.log("Bad calculation: " + error);
      }
    }

    return computedColors;
  }
}
