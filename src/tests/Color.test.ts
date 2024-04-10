import { expect, test } from "vitest";
import { Color } from "../model/color/Color";
import { ColorRgb } from "../model/color/ColorRgb";
import { ColorHslv } from "../model/color/ColorHslv";
import { TestColor, testColors, TestColorNames } from "./TestColors";
import { ColorLabch } from "../model/color/ColorLabch";
import { ColorOklabch } from "../model/color/ColorOklabch";

interface TestHex {
  hex: string;
  red: number;
  green: number;
  blue: number;
}

const testHexNames: TestHex[] = [
  { hex: "#aabbcc", red: 170, green: 187, blue: 204 },
  { hex: "#abc", red: 170, green: 187, blue: 204 },
  { hex: "aabbcc", red: 170, green: 187, blue: 204 },
  { hex: "abc", red: 170, green: 187, blue: 204 },
  { hex: "#AABBCC", red: 170, green: 187, blue: 204 },
  { hex: "#ABC", red: 170, green: 187, blue: 204 },
  { hex: "AABBCC", red: 170, green: 187, blue: 204 },
  { hex: "ABC", red: 170, green: 187, blue: 204 },
  { hex: "#AaBbCc", red: 170, green: 187, blue: 204 },
  { hex: "#AbC", red: 170, green: 187, blue: 204 },
  { hex: "AaBbCc", red: 170, green: 187, blue: 204 },
  { hex: "AbC", red: 170, green: 187, blue: 204 },
  { hex: "#aabbccff", red: 170, green: 187, blue: 204 },
  { hex: "aabbccff", red: 170, green: 187, blue: 204 },
  { hex: "#abcf", red: 170, green: 187, blue: 204 },
  { hex: "abcf", red: 170, green: 187, blue: 204 },
];

const testBadHexNames = ["", "#aa", "#aaaaa", "#aaaaaaa"];

function expectColorRgbEqual(actual: ColorRgb, expected: ColorRgb) {
  for (const property of ["red", "green", "blue"]) {
    const valueActual = actual[property as keyof ColorRgb];
    const valueExpected = expected[property as keyof ColorRgb];
    expect(valueActual, property).toBeCloseTo(valueExpected as number);
  }
}

function expectColorHslvEqual(actual: ColorHslv, expected: ColorHslv) {
  for (const property of ["hue", "saturationL", "lightness", "saturationV", "value"]) {
    const valueActual = actual[property as keyof ColorHslv];
    const valueExpected = expected[property as keyof ColorHslv];
    expect(valueActual, property).toBeCloseTo(valueExpected as number);
  }
}

function expectColorLabchEqual(actual: ColorLabch, expected: ColorLabch) {
  for (const property of ["lightness", "a", "b", "chroma", "hue"]) {
    const valueActual = actual[property as keyof ColorLabch];
    const valueExpected = expected[property as keyof ColorLabch];
    expect(valueActual, property).toBeCloseTo(valueExpected as number);
  }
}

function expectColorOklabchEqual(actual: ColorOklabch, expected: ColorOklabch) {
  for (const property of ["lightness", "a", "b", "chroma", "hue"]) {
    const valueActual = actual[property as keyof ColorOklabch];
    const valueExpected = expected[property as keyof ColorOklabch];
    expect(valueActual, property).toBeCloseTo(valueExpected as number);
  }
}

function expectColorsEqual(actual: Color, expected: Color) {
  expectColorRgbEqual(actual.rgb, expected.rgb);
  expectColorHslvEqual(actual.hslv, expected.hslv);
  expectColorLabchEqual(actual.labch, expected.labch);
  expectColorOklabchEqual(actual.oklabch, expected.oklabch);
  expect(actual.hex).toBe(expected.hex);
}

function expectTestColorRgbEqual(actual: Color, expected: TestColor) {
  expect(actual.rgb.red).toBeCloseTo(expected.red, 1);
  expect(actual.rgb.green).toBeCloseTo(expected.green, 1);
  expect(actual.rgb.blue).toBeCloseTo(expected.blue, 1);
}

function expectTestColorHslEqual(actual: Color, expected: TestColor) {
  if (actual.hslv.lightness > 0 && actual.hslv.lightness < 1) {
    if (actual.hslv.saturationL > 0) {
      expect(actual.hslv.hue).toBeCloseTo(expected.hue, 1);
    }
    expect(actual.hslv.saturationL).toBeCloseTo(expected.saturationL, 2);
  }
  expect(actual.hslv.lightness).toBeCloseTo(expected.lightness, 2);
}

function expectTestColorHsvEqual(actual: Color, expected: TestColor) {
  if (actual.hslv.saturationV > 0) {
    expect(actual.hslv.hue).toBeCloseTo(expected.hue, 1);
  }
  expect(actual.hslv.saturationV).toBeCloseTo(expected.saturationV, 2);
  expect(actual.hslv.value).toBeCloseTo(expected.value, 2);
}

function expectTestColorLabEqual(actual: Color, expected: TestColor) {
  expect(actual.labch.lightness).toBeCloseTo(expected.labLightness, 1);
  expect(actual.labch.a).toBeCloseTo(expected.labA, 1);
  expect(actual.labch.b).toBeCloseTo(expected.labB, 1);
}

function expectTestColorLchEqual(actual: Color, expected: TestColor) {
  expect(actual.labch.lightness).toBeCloseTo(expected.labLightness, 1);
  expect(actual.labch.chroma).toBeCloseTo(expected.lchChroma, 1);

  if (actual.labch.chroma > 0) {
    expect(actual.labch.hue).toBeCloseTo(expected.lchHue, 1);
  }
}

function expectTestColorOklabEqual(actual: Color, expected: TestColor) {
  expect(actual.oklabch.lightness).toBeCloseTo(expected.oklabLightness, 1);
  expect(actual.oklabch.a).toBeCloseTo(expected.oklabA, 1);
  expect(actual.oklabch.b).toBeCloseTo(expected.oklabB, 1);
}

function expectTestColorOklchEqual(actual: Color, expected: TestColor) {
  expect(actual.oklabch.lightness).toBeCloseTo(expected.oklabLightness, 1);
  expect(actual.oklabch.chroma).toBeCloseTo(expected.oklchChroma, 1);

  if (actual.labch.chroma > 0) {
    expect(actual.oklabch.hue).toBeCloseTo(expected.oklchHue, 1);
  }
}

function expectTestColorAllEqual(actual: Color, expected: TestColor) {
  expectTestColorRgbEqual(actual, expected);
  expectTestColorHslEqual(actual, expected);
  expectTestColorHsvEqual(actual, expected);
  expectTestColorLabEqual(actual, expected);
  expectTestColorLchEqual(actual, expected);
  expectTestColorOklabEqual(actual, expected);
  expectTestColorOklchEqual(actual, expected);
  expect(actual.hex).toBe(expected.hex);
}

test("constructs an empty Color", () => {
  const color = new Color();

  expect(color.rgb.red).toBeCloseTo(0);
  expect(color.rgb.green).toBeCloseTo(0);
  expect(color.rgb.blue).toBeCloseTo(0);
});

test.each(testColors)("constructs an RGB Color (%#)", (testColor) => {
  const color = Color.fromRgb(ColorRgb.from(testColor.red, testColor.green, testColor.blue));

  expectTestColorRgbEqual(color, testColor);
});

test.each(testColors)("constructs an HSL Color (%#)", (testColor) => {
  const color = Color.fromHslv(ColorHslv.fromHsl(testColor.hue, testColor.saturationL, testColor.lightness));

  expectTestColorHslEqual(color, testColor);
});

test.each(testColors)("constructs an HSV Color (%#)", (testColor) => {
  const color = Color.fromHslv(ColorHslv.fromHsv(testColor.hue, testColor.saturationV, testColor.value));

  expectTestColorHsvEqual(color, testColor);
});

test.each(testColors)("constructs a LAB Color (%#)", (testColor) => {
  const color = Color.fromLabch(ColorLabch.fromLab(testColor.labLightness, testColor.labA, testColor.labB));

  expectTestColorLabEqual(color, testColor);
});

test.each(testColors)("constructs an LCH Color (%#)", (testColor) => {
  const color = Color.fromLabch(ColorLabch.fromLch(testColor.labLightness, testColor.lchChroma, testColor.lchHue));

  expectTestColorLchEqual(color, testColor);
});

test.each(testColors)("constructs an OkLAB Color (%#)", (testColor) => {
  const color = Color.fromOklabch(ColorOklabch.fromOklab(testColor.oklabLightness, testColor.oklabA, testColor.oklabB));

  expectTestColorOklabEqual(color, testColor);
});

test.each(testColors)("constructs an OkLCH Color (%#)", (testColor) => {
  const color = Color.fromOklabch(
    ColorOklabch.fromOklch(testColor.oklabLightness, testColor.oklchChroma, testColor.oklchHue)
  );

  expectTestColorOklchEqual(color, testColor);
});

test.each(testColors)("constructs a hex Color (%#)", (testColor) => {
  const color = Color.fromHex(testColor.hex);

  expect(color).not.toBeNull();

  expectTestColorRgbEqual(color as Color, testColor);
});

test.each(testColors)("clones a Color (%#)", (testColor) => {
  const color = Color.fromRgb(ColorRgb.from(testColor.red, testColor.green, testColor.blue));
  const newColor = color.clone();

  expectColorsEqual(newColor, color);
});

test.each(testColors)("converts colorspaces (%#)", (testColor) => {
  const colorRgb = Color.fromRgb(ColorRgb.from(testColor.red, testColor.green, testColor.blue));
  const colorHsl = Color.fromHslv(ColorHslv.fromHsl(testColor.hue, testColor.saturationL, testColor.lightness));
  const colorHsv = Color.fromHslv(ColorHslv.fromHsv(testColor.hue, testColor.saturationV, testColor.value));

  expectTestColorAllEqual(colorRgb, testColor);
  expectTestColorAllEqual(colorHsl, testColor);
  expectTestColorAllEqual(colorHsv, testColor);
});

test("adjusts color by RGB", () => {
  let color = new Color();

  color = color.adjustChannel("rgb", "red", 255);
  expectTestColorAllEqual(color, testColors[TestColorNames.Red]);

  color = color.adjustChannel("rgb", "green", 255);
  expectTestColorAllEqual(color, testColors[TestColorNames.Yellow]);

  color = color.adjustChannel("rgb", "blue", 255);
  expectTestColorAllEqual(color, testColors[TestColorNames.White]);

  color = color.adjustChannel("rgb", "red", 0);
  expectTestColorAllEqual(color, testColors[TestColorNames.Cyan]);

  color = color.adjustChannel("rgb", "green", 0);
  expectTestColorAllEqual(color, testColors[TestColorNames.Blue]);

  color = color.adjustChannel("rgb", "blue", 0);
  expectTestColorAllEqual(color, testColors[TestColorNames.Black]);
});

test("adjusts color by HSL", () => {
  let color = Color.fromHslv(ColorHslv.fromHsl(0, 100, 50));

  color = color.adjustChannel("hslv", "hueL", 240);
  expectTestColorAllEqual(color, testColors[TestColorNames.Blue]);

  color = color.adjustChannel("hslv", "saturationL", 49.8);
  expectTestColorAllEqual(color, testColors[TestColorNames.DesaturatedBlue]);

  color = color.adjustChannel("hslv", "lightness", 100);
  expectTestColorAllEqual(color, testColors[TestColorNames.White]);
});

test("adjusts color by HSV", () => {
  let color = Color.fromHslv(ColorHslv.fromHsv(0, 100, 100));

  color = color.adjustChannel("hslv", "hueV", 240);
  expectTestColorAllEqual(color, testColors[TestColorNames.Blue]);

  color = color.adjustChannel("hslv", "value", 49.8);
  expectTestColorAllEqual(color, testColors[TestColorNames.DarkBlue]);

  color = color.adjustChannel("hslv", "saturationV", 0);
  expectTestColorAllEqual(color, testColors[TestColorNames.Gray]);
});

test("adjusts color by LAB", () => {
  let color = Color.fromLabch(ColorLabch.fromLab(0, 0, 0));

  color = color.adjustChannel("labch", "lightnessLab", testColors[TestColorNames.SeaGreen].labLightness);
  color = color.adjustChannel("labch", "a", testColors[TestColorNames.SeaGreen].labA);
  color = color.adjustChannel("labch", "b", testColors[TestColorNames.SeaGreen].labB);

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
});

test("adjusts color by LCH", () => {
  let color = Color.fromLabch(ColorLabch.fromLch(0, 0, 0));

  color = color.adjustChannel("labch", "lightnessLch", testColors[TestColorNames.SeaGreen].labLightness);
  color = color.adjustChannel("labch", "chroma", testColors[TestColorNames.SeaGreen].lchChroma);
  color = color.adjustChannel("labch", "hue", testColors[TestColorNames.SeaGreen].lchHue);

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
});

test("adjusts color by OkLAB", () => {
  let color = Color.fromOklabch(ColorOklabch.fromOklab(0, 0, 0));

  color = color.adjustChannel("oklabch", "lightnessLab", testColors[TestColorNames.SeaGreen].oklabLightness);
  color = color.adjustChannel("oklabch", "a", testColors[TestColorNames.SeaGreen].oklabA);
  color = color.adjustChannel("oklabch", "b", testColors[TestColorNames.SeaGreen].oklabB);

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
});

test("adjusts color by OkLCH", () => {
  let color = Color.fromOklabch(ColorOklabch.fromOklch(0, 0, 0));

  color = color.adjustChannel("oklabch", "lightnessLch", testColors[TestColorNames.SeaGreen].oklabLightness);
  color = color.adjustChannel("oklabch", "chroma", testColors[TestColorNames.SeaGreen].oklchChroma);
  color = color.adjustChannel("oklabch", "hue", testColors[TestColorNames.SeaGreen].oklchHue);

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
});

test("maintains hue when adjusting HSL/HSV", () => {
  const initialColor = Color.fromHslv(ColorHslv.fromHsl(260, 50, 50));
  let color = initialColor.clone();

  expect(color.hslv.hue).toBeCloseTo(260);

  color = initialColor.adjustChannel("hslv", "saturationL", 0);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = color.adjustChannel("hslv", "saturationL", 100);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = initialColor.adjustChannel("hslv", "lightness", 0);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = color.adjustChannel("hslv", "lightness", 100);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = color.adjustChannel("hslv", "lightness", 50);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = initialColor.adjustChannel("hslv", "saturationV", 0);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = color.adjustChannel("hslv", "saturationV", 50);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = initialColor.adjustChannel("hslv", "value", 0);
  expect(color.hslv.hue).toBeCloseTo(260);

  color = color.adjustChannel("hslv", "value", 50);
  expect(color.hslv.hue).toBeCloseTo(260);
});

test("handles hex strings correctly", () => {
  for (const name of testHexNames) {
    const color = Color.fromHex(name.hex);
    expect(color, name.hex).not.toBeNull();
    expect(color?.rgb.red, name.hex).toBeCloseTo(name.red);
    expect(color?.rgb.green, name.hex).toBeCloseTo(name.green);
    expect(color?.rgb.blue, name.hex).toBeCloseTo(name.blue);
  }
  for (const name of testBadHexNames) {
    const color = Color.fromHex(name);
    expect(color, name).toBeNull();
  }
});
