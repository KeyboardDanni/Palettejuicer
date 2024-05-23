import { castDraft, immerable, produce } from "immer";
import { Type } from "class-transformer";

import { throwOnNullIndex } from "../util/checks";
import { clamp } from "../util/math";
import { Color } from "./color/Color";
import { ColorspaceRgb } from "./color/ColorspaceRgb";
import { CelIndex } from "../util/cel";
import { Calculation } from "./calculation/Calculation";

import { CalcCopyColors } from "./calculation/CalcCopyColors";
import { CalcInterpolateStrip } from "./calculation/CalcInterpolateStrip";
import { CalcExtrapolateStrip } from "./calculation/CalcExtrapolateStrip";
import { CalcGamutMap } from "./calculation/CalcGamutMap";

type AvailableCalcItem = {
  value: typeof Calculation;
  name: string;
  beginGroup?: boolean;
};

export const availableCalcs: AvailableCalcItem[] = [
  { value: CalcCopyColors, name: "CalcCopyColors" },
  { value: CalcGamutMap, name: "CalcGamutMap" },
  { value: CalcInterpolateStrip, name: "CalcInterpolateStrip", beginGroup: true },
  { value: CalcExtrapolateStrip, name: "CalcExtrapolateStrip" },
];

export const DEFAULT_PALETTE_WIDTH = 16;
export const DEFAULT_PALETTE_HEIGHT = 16;
export const PALETTE_MIN_WIDTH = 1;
export const PALETTE_MIN_HEIGHT = 1;
export const PALETTE_MAX_WIDTH = 32;
export const PALETTE_MAX_HEIGHT = 64;

const DEFAULT_COLOR = new Color(new ColorspaceRgb().withTransformed(60, 60, 60));

type NullableColor = Color | null;

function stickyOffsetLessThan(value: number, offset: number, oldBoundary: number, newBoundary: number) {
  return value <= oldBoundary ? newBoundary : value + offset;
}

function stickyOffsetGreaterThan(value: number, offset: number, oldBoundary: number, newBoundary: number) {
  return value >= oldBoundary ? newBoundary : value + offset;
}

export class Palette {
  [immerable] = true;

  readonly paletteName: string = "Untitled Palette";

  @Type(() => Calculation, {
    discriminator: {
      property: "calcType",
      subTypes: availableCalcs as any,
    },
  })
  readonly calculations: readonly Calculation[];
  readonly useCalculations: boolean = true;

  readonly width: number;
  readonly exportStart: CelIndex;
  readonly exportEnd: CelIndex;
  @Type(() => Color)
  readonly baseColors: readonly Color[];
  @Type(() => Color)
  readonly computedColors: readonly NullableColor[];

  constructor(width: number = DEFAULT_PALETTE_WIDTH, height: number = DEFAULT_PALETTE_HEIGHT) {
    if (
      width < PALETTE_MIN_WIDTH ||
      height < PALETTE_MIN_HEIGHT ||
      width > PALETTE_MAX_WIDTH ||
      height > PALETTE_MAX_HEIGHT
    ) {
      throw new Error("Invalid Palette dimensions");
    }

    this.width = width;
    this.exportStart = { x: 0, y: 0 };
    this.exportEnd = { x: width - 1, y: height - 1 };
    this.calculations = [];
    this.baseColors = new Array(width * height).fill(null).map((_) => DEFAULT_COLOR);
    this.computedColors = new Array(width * height).fill(null);
  }

  get height(): number {
    return Math.floor(this.baseColors.length / this.width);
  }

  get dimensions(): [number, number] {
    return [this.width, Math.floor(this.baseColors.length / this.width)];
  }

  indexInBounds(index: CelIndex): boolean {
    return index.x >= 0 && index.x < this.width && index.y >= 0 && index.y < this.height;
  }

  clampIndex(index: CelIndex): CelIndex {
    return {
      x: clamp(index.x, 0, this.width - 1),
      y: clamp(index.y, 0, this.height - 1),
    };
  }

  indexToOffset(index: CelIndex): number | null {
    if (index.x < 0 || index.x >= this.width || index.y < 0 || index.y >= this.height) {
      return null;
    }

    return index.y * this.width + index.x;
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

  colors(): Color[] {
    if (!this.useCalculations) {
      return [...this.baseColors];
    }

    const colors = this.computedColors.map((color, i) => {
      return color !== null ? color : this.baseColors[i];
    });

    return colors;
  }

  baseColor(index: CelIndex): Color {
    const offset = throwOnNullIndex(this.indexToOffset(index));

    return this.baseColors[offset];
  }

  computeColors(): NullableColor[] {
    const dimensions = this.dimensions;
    const computedColors = new Array(this.baseColors.length).fill(null);

    const getTempColor = (index: CelIndex): Color => {
      const offset = throwOnNullIndex(this.indexToOffset(index));

      return computedColors[offset] ?? this.baseColors[offset];
    };

    for (const calc of this.calculations) {
      if (!calc.enabled) continue;

      try {
        const inputIndexes = calc.inputCels(dimensions);
        const colors = inputIndexes.map((index) => getTempColor(index));

        const result = calc.computeColors(colors, dimensions);

        for (const cel of result.cels) {
          const offset = this.indexToOffset(cel.index);

          if (offset !== null && cel.color !== null) {
            computedColors[offset] = cel.color;
          }
        }
      } catch (error) {
        // TODO better error handling
        console.error("Bad calculation: " + error);
      }
    }

    return computedColors;
  }

  resize(newWidth: number, newHeight: number, offsetX: number, offsetY: number): Palette {
    if (
      newWidth < PALETTE_MIN_WIDTH ||
      newHeight < PALETTE_MIN_HEIGHT ||
      newWidth > PALETTE_MAX_WIDTH ||
      newHeight > PALETTE_MAX_HEIGHT
    ) {
      throw new Error("Invalid Palette dimensions");
    }

    return produce(this, (draft) => {
      const [oldWidth, oldHeight] = draft.dimensions;
      const newBaseColors = new Array(newWidth * newHeight).fill(null).map((_) => DEFAULT_COLOR);

      for (let y = 0; y < oldHeight; y++) {
        const newY = y + offsetY;

        if (newY < 0 || newY >= newHeight) continue;

        for (let x = 0; x < oldWidth; x++) {
          const newX = x + offsetX;

          if (newX < 0 || newX >= newWidth) continue;

          newBaseColors[newY * newWidth + newX] = draft.baseColors[y * oldWidth + x];
        }
      }

      draft.width = newWidth;

      draft.exportStart.x = stickyOffsetLessThan(draft.exportStart.x, offsetX, 0, 0);
      draft.exportStart.y = stickyOffsetLessThan(draft.exportStart.y, offsetY, 0, 0);
      draft.exportEnd.x = stickyOffsetGreaterThan(draft.exportEnd.x, offsetX, oldWidth - 1, newWidth - 1);
      draft.exportEnd.y = stickyOffsetGreaterThan(draft.exportEnd.y, offsetY, oldHeight - 1, newHeight - 1);

      draft.baseColors = castDraft(newBaseColors);
      draft.calculations = draft.calculations.map((calc) => calc.nudgeCelIndexes(offsetX, offsetY));
      draft.computedColors = castDraft(draft.computeColors());
    });
  }
}
