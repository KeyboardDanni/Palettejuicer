import "reflect-metadata";

import { expect, test } from "vitest";
import { immerable, produce } from "immer";

import { CelIndex, PALETTE_HEIGHT, PALETTE_WIDTH, Palette } from "../model/Palette";
import { Color } from "../model/color/Color";
import { ColorRgb } from "../model/color/ColorRgb";
import { Calculation, CalculationCel, CalculationResult } from "../model/calculation/Calculation";
import { CalcPropertiesViewProps } from "../widgets/PropertiesView";

const HEX_RED = "#ff2222";
const HEX_GREEN = "#22ff22";
const HEX_BLUE = "#2222ff";

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
  inputCels(): CelIndex[] {
    return [this.source];
  }
  outputCels(): CelIndex[] {
    return [...this.destinations];
  }
  computeColors(colors: Color[]): CalculationResult {
    const cels: CalculationCel[] = [];

    for (const index of this.destinations) {
      cels.push({
        index,
        color: colors[0],
      });
    }

    return { cels };
  }
  propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element {
    throw new Error("Method not implemented.");
  }
}

test("constructs a default Palette", () => {
  const palette = new Palette();

  expect(palette.baseColors.length).toBe(PALETTE_WIDTH * PALETTE_HEIGHT);
  expect(palette.computedColors.length).toBe(PALETTE_WIDTH * PALETTE_HEIGHT);
  expect(palette.calculations.length).toBe(0);

  for (const color of palette.computedColors) {
    expect(color).toBeNull();
  }
});

test("converts CelIndex to 1D offset", () => {
  const palette = new Palette();

  for (let i = 0; i < PALETTE_WIDTH * PALETTE_HEIGHT; i++) {
    const x = i % PALETTE_WIDTH;
    const y = Math.floor(i / PALETTE_WIDTH);

    const index = palette.indexToOffset({ x, y });

    expect(index).toBe(i);
  }
});

test("handles CelIndex out of bounds", () => {
  const palette = new Palette();
  const inBounds = [
    { x: 0, y: 0 },
    { x: PALETTE_WIDTH - 1, y: 0 },
    { x: 0, y: PALETTE_HEIGHT - 1 },
    { x: PALETTE_WIDTH - 1, y: PALETTE_HEIGHT - 1 },
  ];
  const outOfBounds = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -2, y: -2 },
    { x: PALETTE_WIDTH, y: 0 },
    { x: 0, y: PALETTE_HEIGHT },
    { x: PALETTE_WIDTH, y: PALETTE_HEIGHT },
    { x: PALETTE_WIDTH + 1, y: PALETTE_HEIGHT + 1 },
  ];

  for (const index of inBounds) {
    expect(palette.indexToOffset(index)).not.toBeNull();
  }
  for (const index of outOfBounds) {
    expect(palette.indexToOffset(index)).toBeNull();
  }
});

test("handles base and computed colors", () => {
  let palette = new Palette();
  const red = Color.fromRgb(ColorRgb.fromHex(HEX_RED) as ColorRgb);
  const green = Color.fromRgb(ColorRgb.fromHex(HEX_GREEN) as ColorRgb);
  const blue = Color.fromRgb(ColorRgb.fromHex(HEX_BLUE) as ColorRgb);

  palette = produce(palette, (draft) => {
    draft.baseColors[0] = red;
    draft.baseColors[1] = green;
    draft.computedColors[1] = blue;
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
  const red = Color.fromRgb(ColorRgb.fromHex(HEX_RED) as ColorRgb);
  const green = Color.fromRgb(ColorRgb.fromHex(HEX_GREEN) as ColorRgb);

  let calc = new TestCalculation();

  calc = produce(calc, (draft) => {
    draft.source = { x: 0, y: 0 };
    draft.destinations = [
      { x: 1, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ];
  });

  palette = produce(palette, (draft) => {
    draft.baseColors[0] = red;

    for (let i = 1; i < 6; i++) {
      draft.baseColors[i] = green;
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
    draft.computedColors = results;
  });

  expect(palette.color({ x: 0, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 1, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 2, y: 0 }).rgb.hex).toBe(HEX_GREEN);
  expect(palette.color({ x: 3, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 4, y: 0 }).rgb.hex).toBe(HEX_RED);
  expect(palette.color({ x: 5, y: 0 }).rgb.hex).toBe(HEX_GREEN);
});
