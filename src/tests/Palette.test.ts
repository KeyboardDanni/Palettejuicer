import "reflect-metadata";

import { expect, test } from "vitest";
import { immerable, produce, castDraft } from "immer";

import { DEFAULT_PALETTE_HEIGHT, DEFAULT_PALETTE_WIDTH, Palette } from "../model/Palette";
import { CelIndex } from "../util/cel";
import { Color } from "../model/color/Color";
import { ColorspaceRgb } from "../model/color/ColorspaceRgb";
import {
  Calculation,
  CalculationCel,
  CalculationResult,
  CalcPropertiesViewProps,
} from "../model/calculation/Calculation";
import { throwOnNullIndex } from "../util/checks";

const HEX_RED = "#ff2222";
const HEX_GREEN = "#22ff22";
const HEX_BLUE = "#2222ff";

const PALETTE_DIMENSIONS = [
  [16, 16],
  [12, 20],
  [1, 1],
  [32, 64],
  [1, 64],
  [32, 1],
];

const BAD_PALETTE_DIMENSIONS = [
  [0, 0],
  [0, 1],
  [1, 0],
  [-1, -1],
  [33, 64],
  [32, 65],
  [NaN, 64],
  [32, NaN],
];

const IN_BOUNDS_INDEXES = [
  { x: 0, y: 0 },
  { x: DEFAULT_PALETTE_WIDTH - 1, y: 0 },
  { x: 0, y: DEFAULT_PALETTE_HEIGHT - 1 },
  { x: DEFAULT_PALETTE_WIDTH - 1, y: DEFAULT_PALETTE_HEIGHT - 1 },
];

const OUT_OF_BOUNDS_INDEXES = [
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: -2, y: -2 },
  { x: DEFAULT_PALETTE_WIDTH, y: 0 },
  { x: 0, y: DEFAULT_PALETTE_HEIGHT },
  { x: DEFAULT_PALETTE_WIDTH, y: DEFAULT_PALETTE_HEIGHT },
  { x: DEFAULT_PALETTE_WIDTH + 1, y: DEFAULT_PALETTE_HEIGHT + 1 },
];

const CLAMPED_OUT_OF_BOUNDS_INDEXES = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: DEFAULT_PALETTE_WIDTH - 1, y: 0 },
  { x: 0, y: DEFAULT_PALETTE_HEIGHT - 1 },
  { x: DEFAULT_PALETTE_WIDTH - 1, y: DEFAULT_PALETTE_HEIGHT - 1 },
  { x: DEFAULT_PALETTE_WIDTH - 1, y: DEFAULT_PALETTE_HEIGHT - 1 },
];

const RESIZE_DIMENSIONS = [
  [DEFAULT_PALETTE_WIDTH, DEFAULT_PALETTE_HEIGHT, 0, 0],
  [DEFAULT_PALETTE_WIDTH + 1, DEFAULT_PALETTE_HEIGHT + 1, 0, 0],
  [DEFAULT_PALETTE_WIDTH + 1, DEFAULT_PALETTE_HEIGHT + 1, 1, 1],
  [DEFAULT_PALETTE_WIDTH - 1, DEFAULT_PALETTE_HEIGHT - 1, -1, -1],
  [DEFAULT_PALETTE_WIDTH, DEFAULT_PALETTE_HEIGHT, 3, -3],
  [DEFAULT_PALETTE_WIDTH + 16, DEFAULT_PALETTE_HEIGHT + 16, 16, 16],
];

class TestCalculation extends Calculation {
  [immerable] = true;

  readonly source: CelIndex = { x: 0, y: 0 };
  readonly destinations: readonly CelIndex[] = [];

  static calcName(): string {
    return "Test Calculation";
  }
  static description(): string {
    return "A basic calculation";
  }
  listDescription(): string {
    return "Test Calculation";
  }
  inputCels(_dimensions: [number, number]): CelIndex[] {
    return [this.source];
  }
  outputCels(_dimensions: [number, number]): CelIndex[] {
    return [...this.destinations];
  }
  computeColors(colors: Color[], _dimensions: [number, number]): CalculationResult {
    const cels: CalculationCel[] = [];

    for (const index of this.destinations) {
      cels.push({
        index,
        color: colors[0],
      });
    }

    return { cels };
  }
  nudgeCelIndexes(offsetX: number, offsetY: number): Calculation {
    return produce(this, (draft) => {
      draft.source.x += offsetX;
      draft.source.y += offsetY;
      draft.destinations = draft.destinations.map((destination) => {
        return {
          x: destination.x + offsetX,
          y: destination.y + offsetY,
        };
      });
    });
  }
  propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element {
    throw new Error("Method not implemented.");
  }
}

test("constructs a default Palette", () => {
  const palette = new Palette();

  expect(palette.baseColors.length).toBe(DEFAULT_PALETTE_WIDTH * DEFAULT_PALETTE_HEIGHT);
  expect(palette.computedColors.length).toBe(DEFAULT_PALETTE_WIDTH * DEFAULT_PALETTE_HEIGHT);
  expect(palette.calculations.length).toBe(0);
  expect(palette.width).toBe(DEFAULT_PALETTE_WIDTH);
  expect(palette.height).toBe(DEFAULT_PALETTE_HEIGHT);

  for (const color of palette.computedColors) {
    expect(color).toBeNull();
  }
});

test.each(PALETTE_DIMENSIONS)("constructs a Palette with specific dimensions (%i, %i)", (width, height) => {
  const palette = new Palette(width, height);

  expect(palette.baseColors.length).toBe(width * height);
  expect(palette.computedColors.length).toBe(width * height);
  expect(palette.calculations.length).toBe(0);
  expect(palette.width).toBe(width);
  expect(palette.height).toBe(height);

  for (const color of palette.computedColors) {
    expect(color).toBeNull();
  }
});

test.each(BAD_PALETTE_DIMENSIONS)("throws on constructing a Palette with bad dimensions (%i, %i)", (width, height) => {
  expect(() => {
    new Palette(width, height);
  }).toThrow();
});

test("converts CelIndex to 1D offset", () => {
  const palette = new Palette();

  for (let i = 0; i < DEFAULT_PALETTE_WIDTH * DEFAULT_PALETTE_HEIGHT; i++) {
    const x = i % DEFAULT_PALETTE_WIDTH;
    const y = Math.floor(i / DEFAULT_PALETTE_WIDTH);

    const index = palette.indexToOffset({ x, y });

    expect(index).toBe(i);
  }
});

test("handles CelIndex out of bounds", () => {
  const palette = new Palette();

  for (const index of IN_BOUNDS_INDEXES) {
    expect(palette.indexToOffset(index)).not.toBeNull();
    expect(palette.indexInBounds(index)).toBeTruthy();
  }

  for (const index of OUT_OF_BOUNDS_INDEXES) {
    expect(palette.indexToOffset(index)).toBeNull();
    expect(palette.indexInBounds(index)).toBeFalsy();
  }
});

test("clamps CelIndex in bounds", () => {
  const palette = new Palette();

  for (const index of IN_BOUNDS_INDEXES) {
    const clamped = palette.clampIndex(index);

    expect(clamped.x).toBe(index.x);
    expect(clamped.y).toBe(index.y);
  }

  for (const [i, index] of OUT_OF_BOUNDS_INDEXES.entries()) {
    const clamped = palette.clampIndex(index);
    const expected = CLAMPED_OUT_OF_BOUNDS_INDEXES[i];

    expect(palette.indexToOffset(clamped)).not.toBeNull();
    expect(palette.indexInBounds(clamped)).toBeTruthy();
    expect(clamped.x).toBe(expected.x);
    expect(clamped.y).toBe(expected.y);
  }
});

test("handles base and computed colors", () => {
  let palette = new Palette();
  const red = new Color(ColorspaceRgb.fromHex(HEX_RED) as ColorspaceRgb);
  const green = new Color(ColorspaceRgb.fromHex(HEX_GREEN) as ColorspaceRgb);
  const blue = new Color(ColorspaceRgb.fromHex(HEX_BLUE) as ColorspaceRgb);

  palette = produce(palette, (draft) => {
    draft.baseColors[0] = castDraft(red);
    draft.baseColors[1] = castDraft(green);
    draft.computedColors[1] = castDraft(blue);
  });

  expect(palette.color({ x: 0, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 1, y: 0 }).rgb.hex).toBe(HEX_BLUE);
  expect(palette.baseColor({ x: 0, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.baseColor({ x: 1, y: 0 }).rgb.hex).toBe(HEX_GREEN);

  expect(palette.isComputed({ x: 0, y: 0 })).toBeFalsy();
  expect(palette.isComputed({ x: 1, y: 0 })).toBeTruthy();
  expect(palette.isOffsetComputed(0)).toBeFalsy();
  expect(palette.isOffsetComputed(1)).toBeTruthy();
});

test("computes new colors given a calculation", () => {
  let palette = new Palette();
  const red = new Color(ColorspaceRgb.fromHex(HEX_RED) as ColorspaceRgb);
  const green = new Color(ColorspaceRgb.fromHex(HEX_GREEN) as ColorspaceRgb);

  const calc = produce(new TestCalculation(), (draft) => {
    draft.source = { x: 0, y: 0 };
    draft.destinations = [
      { x: 1, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ];
  });

  palette = produce(palette, (draft) => {
    draft.baseColors[0] = castDraft(red);

    for (let i = 1; i < 6; i++) {
      draft.baseColors[i] = castDraft(green);
    }

    draft.calculations.push(calc);
  });

  const results = palette.computeColors();

  expect(results[0]).toBeNull();
  expect(results[1]?.rgb.hex).toBe(HEX_RED);
  expect(results[2]).toBeNull();
  expect(results[3]?.rgb.hex).toBe(HEX_RED);
  expect(results[4]?.rgb.hex).toBe(HEX_RED);
  expect(results[5]).toBeNull();

  palette = produce(palette, (draft) => {
    draft.computedColors = castDraft(results);
  });

  expect(palette.color({ x: 0, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 1, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 2, y: 0 }).rgb.hex).toBe(HEX_GREEN);
  expect(palette.color({ x: 3, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 4, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 5, y: 0 }).rgb.hex).toBe(HEX_GREEN);
});

test.each(PALETTE_DIMENSIONS)("resizes a Palette (%i, %i)", (width, height) => {
  const palette = new Palette();
  const resized = palette.resize(width, height, 0, 0);

  expect(resized.baseColors.length).toBe(width * height);
  expect(resized.computedColors.length).toBe(width * height);
  expect(resized.calculations.length).toBe(0);
  expect(resized.width).toBe(width);
  expect(resized.height).toBe(height);

  for (const color of resized.computedColors) {
    expect(color).toBeNull();
  }
});

test.each(BAD_PALETTE_DIMENSIONS)("throws on resizing a Palette to bad dimensions (%i, %i)", (width, height) => {
  const palette = new Palette();

  expect(() => {
    palette.resize(width, height, 0, 0);
  }).toThrow();
});

test.each(RESIZE_DIMENSIONS)(
  "nudges contents when resizing a Palette (%i, %i offset %i %i)",
  (width, height, offsetX, offsetY) => {
    let palette = new Palette();
    const red = new Color(ColorspaceRgb.fromHex(HEX_RED) as ColorspaceRgb);

    const calc1 = produce(new TestCalculation(), (draft) => {
      draft.source = { x: 5, y: 5 };
      draft.destinations = [{ x: 7, y: 7 }];
    });

    const calc2 = produce(new TestCalculation(), (draft) => {
      draft.source = { x: 7, y: 7 };
      draft.destinations = [
        { x: 8, y: 5 },
        { x: 5, y: 8 },
      ];
    });

    palette = produce(palette, (draft) => {
      const offset = throwOnNullIndex(draft.indexToOffset({ x: 5, y: 5 }));
      draft.baseColors[offset] = castDraft(red);

      draft.calculations.push(calc1);
      draft.calculations.push(calc2);

      draft.computedColors = castDraft(draft.computeColors());
    });

    const resized = palette.resize(width, height, offsetX, offsetY);

    expect(resized.color({ x: 5 + offsetX, y: 5 + offsetY }).rgb.hex).toBe(HEX_RED);
    expect(resized.color({ x: 7 + offsetX, y: 7 + offsetY }).rgb.hex).toBe(HEX_RED);
    expect(resized.color({ x: 8 + offsetX, y: 5 + offsetY }).rgb.hex).toBe(HEX_RED);
    expect(resized.color({ x: 5 + offsetX, y: 8 + offsetY }).rgb.hex).toBe(HEX_RED);
  }
);
