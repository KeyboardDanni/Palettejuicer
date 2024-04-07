import { expect, test } from "vitest";
import Color from "./Color";
import { ColorRgb } from "./ColorRgb";
import { ColorHslv } from "./ColorHslv";

interface TestColor {
  red: number;
  green: number;
  blue: number;
  hue: number;
  saturationL: number;
  lightness: number;
  saturationV: number;
  value: number;
  hex: string;
}

enum TestColorNames {
    Black,
    White,
    Gray,
    DarkGray,
    LightGray,
    Red,
    Orange,
    Yellow,
    Lime,
    Green,
    SeaGreen,
    Cyan,
    CoolBlue,
    Blue,
    Purple,
    Magenta,
    HotPink,
    DarkRed,
    DarkOrange,
    DarkYellow,
    DarkLime,
    DarkGreen,
    DarkSeaGreen,
    DarkCyan,
    DarkCoolBlue,
    DarkBlue,
    DarkPurple,
    DarkMagenta,
    DarkHotPink,
    DesaturatedRed,
    DesaturatedOrange,
    DesaturatedYellow,
    DesaturatedLime,
    DesaturatedGreen,
    DesaturatedSeaGreen,
    DesaturatedCyan,
    DesaturatedCoolBlue,
    DesaturatedBlue,
    DesaturatedPurple,
    DesaturatedMagenta,
    DesaturatedHotPink,
    PastelRed,
    PastelOrange,
    PastelYellow,
    PastelLime,
    PastelGreen,
    PastelSeaGreen,
    PastelCyan,
    PastelCoolBlue,
    PastelBlue,
    PastelPurple,
    PastelMagenta,
    PastelHotPink
}

const testColors: TestColor[] = [
  // grayscale

  {red: 0, green: 0, blue: 0, // black
    hue: 0, saturationL: 0, lightness: 0,
    saturationV: 0, value: 0,
    hex: "#000000"},
  {red: 255, green: 255, blue: 255, // white
    hue: 0, saturationL: 0, lightness: 100,
    saturationV: 0, value: 100,
    hex: "#ffffff"},
  {red: 127, green: 127, blue: 127, // gray
    hue: 0, saturationL: 0, lightness: 49.8,
    saturationV: 0, value: 49.8,
    hex: "#7f7f7f"},
  {red: 64, green: 64, blue: 64, // dark gray
    hue: 0, saturationL: 0, lightness: 25.1,
    saturationV: 0, value: 25.1,
    hex: "#404040"},
  {red: 191, green: 191, blue: 191, // light gray
    hue: 0, saturationL: 0, lightness: 74.9,
    saturationV: 0, value: 74.9,
    hex: "#bfbfbf"},

  // saturated colors

  {red: 255, green: 0, blue: 0, // red
    hue: 0, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#ff0000"},
  {red: 255, green: 127, blue: 0, // orange
    hue: 29.88, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#ff7f00"},
  {red: 255, green: 255, blue: 0, // yellow
    hue: 60, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#ffff00"},
  {red: 191, green: 255, blue: 0, // lime
    hue: 75.06, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#bfff00"},
  {red: 0, green: 255, blue: 0, // green
    hue: 120, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#00ff00"},
  {red: 0, green: 255, blue: 160, // sea green
    hue: 157.65, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#00ffa0"},
  {red: 0, green: 255, blue: 255, // cyan
    hue: 180, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#00ffff"},
  {red: 0, green: 180, blue: 255, // cool blue
    hue: 197.65, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#00b4ff"},
  {red: 0, green: 0, blue: 255, // blue
    hue: 240, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#0000ff"},
  {red: 127, green: 0, blue: 255, // purple
    hue: 269.88, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#7f00ff"},
  {red: 255, green: 0, blue: 255, // magenta
    hue: 300, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#ff00ff"},
  {red: 255, green: 0, blue: 160, // hot pink
    hue: 322.35, saturationL: 100, lightness: 50,
    saturationV: 100, value: 100,
    hex: "#ff00a0"},

  // dark colors

  {red: 127, green: 0, blue: 0, // red
    hue: 0, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#7f0000"},
  {red: 127, green: 64, blue: 0, // orange
    hue: 30.24, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#7f4000"},
  {red: 127, green: 127, blue: 0, // yellow
    hue: 60, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#7f7f00"},
  {red: 96, green: 127, blue: 0, // lime
    hue: 74.65, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#607f00"},
  {red: 0, green: 127, blue: 0, // green
    hue: 120, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#007f00"},
  {red: 0, green: 127, blue: 80, // sea green
    hue: 157.8, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#007f50"},
  {red: 0, green: 127, blue: 127, // cyan
    hue: 180, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#007f7f"},
  {red: 0, green: 90, blue: 127, // cool blue
    hue: 197.48, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#005a7f"},
  {red: 0, green: 0, blue: 127, // blue
    hue: 240, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#00007f"},
  {red: 64, green: 0, blue: 127, // purple
    hue: 270.24, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#40007f"},
  {red: 127, green: 0, blue: 127, // magenta
    hue: 300, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#7f007f"},
  {red: 127, green: 0, blue: 80, // hot pink
    hue: 322.2, saturationL: 100, lightness: 24.9,
    saturationV: 100, value: 49.8,
    hex: "#7f0050"},

  // desaturated colors

  {red: 191, green: 64, blue: 64, // red
    hue: 0, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#bf4040"},
  {red: 191, green: 127, blue: 64, // orange
    hue: 29.76, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#bf7f40"},
  {red: 191, green: 191, blue: 64, // yellow
    hue: 60, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#bfbf40"},
  {red: 160, green: 191, blue: 64, // lime
    hue: 74.65, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#a0bf40"},
  {red: 64, green: 191, blue: 64, // green
    hue: 120, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#40bf40"},
  {red: 64, green: 191, blue: 144, // sea green
    hue: 157.8, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#40bf90"},
  {red: 64, green: 191, blue: 191, // cyan
    hue: 180, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#40bfbf"},
  {red: 64, green: 154, blue: 191, // cool blue
    hue: 197.48, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#409abf"},
  {red: 64, green: 64, blue: 191, // blue
    hue: 240, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#4040bf"},
  {red: 127, green: 64, blue: 191, // purple
    hue: 269.76, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#7f40bf"},
  {red: 191, green: 64, blue: 191, // magenta
    hue: 300, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#bf40bf"},
  {red: 191, green: 64, blue: 144, // hot pink
    hue: 322.2, saturationL: 49.8, lightness: 50,
    saturationV: 66.49, value: 74.9,
    hex: "#bf4090"},

  // pastel colors
  
  {red: 245, green: 163, blue: 163, // red
    hue: 0, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#f5a3a3"},
  {red: 245, green: 204, blue: 163, // orange
    hue: 30, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#f5cca3"},
  {red: 245, green: 245, blue: 163, // yellow
    hue: 60, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#f5f5a3"},
  {red: 224, green: 245, blue: 163, // lime
    hue: 75.37, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#e0f5a3"},
  {red: 163, green: 245, blue: 163, // green
    hue: 120, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#a3f5a3"},
  {red: 163, green: 245, blue: 214, // sea green
    hue: 157.32, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#a3f5d6"},
  {red: 163, green: 245, blue: 245, // cyan
    hue: 180, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#a3f5f5"},
  {red: 163, green: 221, blue: 245, // cool blue
    hue: 197.56, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#a3ddf5"},
  {red: 163, green: 163, blue: 245, // blue
    hue: 240, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#a3a3f5"},
  {red: 204, green: 163, blue: 245, // purple
    hue: 270, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#cca3f5"},
  {red: 245, green: 163, blue: 245, // magenta
    hue: 300, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#f5a3f5"},
  {red: 245, green: 163, blue: 214, // hot pink
    hue: 322.68, saturationL: 80.39, lightness: 80,
    saturationV: 33.47, value: 96.08,
    hex: "#f5a3d6"},
];

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

const testBadHexNames = [
  "", "#aa", "#aaaaa", "#aaaaaaa"
];

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

function expectColorsEqual(actual: Color, expected: Color) {
  expectColorRgbEqual(actual.rgb, expected.rgb);
  expectColorHslvEqual(actual.hslv, expected.hslv);
  expect(actual.hex).toBe(expected.hex);
}

function expectTestColorRgbEqual(actual: Color, expected: TestColor) {
  expect(actual.rgb.red).toBeCloseTo(expected.red, 0);
  expect(actual.rgb.green).toBeCloseTo(expected.green, 0);
  expect(actual.rgb.blue).toBeCloseTo(expected.blue, 0);
}

function expectTestColorHslEqual(actual: Color, expected: TestColor) {
  if (actual.hslv.lightness > 0 && actual.hslv.lightness < 1) {
    if (actual.hslv.saturationL > 0) {
      expect(actual.hslv.hue).toBeCloseTo(expected.hue, 0);
    }
    expect(actual.hslv.saturationL).toBeCloseTo(expected.saturationL, 2);
  }
  expect(actual.hslv.lightness).toBeCloseTo(expected.lightness, 2);
}

function expectTestColorHsvEqual(actual: Color, expected: TestColor) {
  if (actual.hslv.saturationV > 0) {
    expect(actual.hslv.hue).toBeCloseTo(expected.hue, 0);
  }
  expect(actual.hslv.saturationV).toBeCloseTo(expected.saturationV, 2);
  expect(actual.hslv.value).toBeCloseTo(expected.value, 2);
}

function expectTestColorAllEqual(actual: Color, expected: TestColor) {
  expectTestColorRgbEqual(actual, expected);
  expectTestColorHslEqual(actual, expected);
  expectTestColorHsvEqual(actual, expected);
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
  const colorRgb = Color.fromRgb(ColorRgb.from(
      testColor.red, testColor.green, testColor.blue));
  const colorHsl = Color.fromHslv(ColorHslv.fromHsl(
      testColor.hue, testColor.saturationL, testColor.lightness));
  const colorHsv = Color.fromHslv(ColorHslv.fromHsv(
      testColor.hue, testColor.saturationV, testColor.value));
  
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
