import { expect, test } from "vitest";
import Color, { Channel, Colorspace } from "./Color";

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
    hue: 0, saturationL: 0, lightness: 1.0,
    saturationV: 0, value: 1.0,
    hex: "#ffffff"},
  {red: 127, green: 127, blue: 127, // gray
    hue: 0, saturationL: 0, lightness: 0.498,
    saturationV: 0, value: 0.498,
    hex: "#7f7f7f"},
  {red: 64, green: 64, blue: 64, // dark gray
    hue: 0, saturationL: 0, lightness: 0.251,
    saturationV: 0, value: 0.251,
    hex: "#404040"},
  {red: 191, green: 191, blue: 191, // light gray
    hue: 0, saturationL: 0, lightness: 0.749,
    saturationV: 0, value: 0.749,
    hex: "#bfbfbf"},

  // saturated colors

  {red: 255, green: 0, blue: 0, // red
    hue: 0, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#ff0000"},
  {red: 255, green: 127, blue: 0, // orange
    hue: 29.88, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#ff7f00"},
  {red: 255, green: 255, blue: 0, // yellow
    hue: 60, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#ffff00"},
  {red: 191, green: 255, blue: 0, // lime
    hue: 75.06, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#bfff00"},
  {red: 0, green: 255, blue: 0, // green
    hue: 120, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#00ff00"},
  {red: 0, green: 255, blue: 160, // sea green
    hue: 157.65, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#00ffa0"},
  {red: 0, green: 255, blue: 255, // cyan
    hue: 180, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#00ffff"},
  {red: 0, green: 180, blue: 255, // cool blue
    hue: 197.65, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#00b4ff"},
  {red: 0, green: 0, blue: 255, // blue
    hue: 240, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#0000ff"},
  {red: 127, green: 0, blue: 255, // purple
    hue: 269.88, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#7f00ff"},
  {red: 255, green: 0, blue: 255, // magenta
    hue: 300, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#ff00ff"},
  {red: 255, green: 0, blue: 160, // hot pink
    hue: 322.35, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1,
    hex: "#ff00a0"},

  // dark colors

  {red: 127, green: 0, blue: 0, // red
    hue: 0, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#7f0000"},
  {red: 127, green: 64, blue: 0, // orange
    hue: 30.24, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#7f4000"},
  {red: 127, green: 127, blue: 0, // yellow
    hue: 60, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#7f7f00"},
  {red: 96, green: 127, blue: 0, // lime
    hue: 74.65, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#607f00"},
  {red: 0, green: 127, blue: 0, // green
    hue: 120, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#007f00"},
  {red: 0, green: 127, blue: 80, // sea green
    hue: 157.8, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#007f50"},
  {red: 0, green: 127, blue: 127, // cyan
    hue: 180, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#007f7f"},
  {red: 0, green: 90, blue: 127, // cool blue
    hue: 197.48, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#005a7f"},
  {red: 0, green: 0, blue: 127, // blue
    hue: 240, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#00007f"},
  {red: 64, green: 0, blue: 127, // purple
    hue: 270.24, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#40007f"},
  {red: 127, green: 0, blue: 127, // magenta
    hue: 300, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#7f007f"},
  {red: 127, green: 0, blue: 80, // hot pink
    hue: 322.2, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498,
    hex: "#7f0050"},

  // desaturated colors

  {red: 191, green: 64, blue: 64, // red
    hue: 0, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#bf4040"},
  {red: 191, green: 127, blue: 64, // orange
    hue: 29.76, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#bf7f40"},
  {red: 191, green: 191, blue: 64, // yellow
    hue: 60, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#bfbf40"},
  {red: 160, green: 191, blue: 64, // lime
    hue: 74.65, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#a0bf40"},
  {red: 64, green: 191, blue: 64, // green
    hue: 120, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#40bf40"},
  {red: 64, green: 191, blue: 144, // sea green
    hue: 157.8, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#40bf90"},
  {red: 64, green: 191, blue: 191, // cyan
    hue: 180, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#40bfbf"},
  {red: 64, green: 154, blue: 191, // cool blue
    hue: 197.48, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#409abf"},
  {red: 64, green: 64, blue: 191, // blue
    hue: 240, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#4040bf"},
  {red: 127, green: 64, blue: 191, // purple
    hue: 269.76, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#7f40bf"},
  {red: 191, green: 64, blue: 191, // magenta
    hue: 300, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#bf40bf"},
  {red: 191, green: 64, blue: 144, // hot pink
    hue: 322.2, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749,
    hex: "#bf4090"},

  // pastel colors
  
  {red: 245, green: 163, blue: 163, // red
    hue: 0, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#f5a3a3"},
  {red: 245, green: 204, blue: 163, // orange
    hue: 30, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#f5cca3"},
  {red: 245, green: 245, blue: 163, // yellow
    hue: 60, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#f5f5a3"},
  {red: 224, green: 245, blue: 163, // lime
    hue: 75.37, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#e0f5a3"},
  {red: 163, green: 245, blue: 163, // green
    hue: 120, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#a3f5a3"},
  {red: 163, green: 245, blue: 214, // sea green
    hue: 157.32, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#a3f5d6"},
  {red: 163, green: 245, blue: 245, // cyan
    hue: 180, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#a3f5f5"},
  {red: 163, green: 221, blue: 245, // cool blue
    hue: 197.56, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#a3ddf5"},
  {red: 163, green: 163, blue: 245, // blue
    hue: 240, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#a3a3f5"},
  {red: 204, green: 163, blue: 245, // purple
    hue: 270, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#cca3f5"},
  {red: 245, green: 163, blue: 245, // magenta
    hue: 300, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
    hex: "#f5a3f5"},
  {red: 245, green: 163, blue: 214, // hot pink
    hue: 322.68, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608,
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

function expectColorPropertiesEqual(actual: Color, expected: Color) {
  for (const property of ["red", "green", "blue", "hue", "saturationL", "lightness", "saturationV", "value"]) {
    const valueActual = actual[property as keyof Color];
    const valueExpected = expected[property as keyof Color];
    expect(valueActual, property).toBeCloseTo(valueExpected as number);
  }
}

function expectColorsEqual(actual: Color, expected: Color) {
  expect(actual.colorspace).toBeCloseTo(expected.colorspace);

  expectColorPropertiesEqual(actual, expected);
}

function expectTestColorEqual(actual: Color, expected: TestColor, properties: string[], digits: number) {
  for (const property of properties) {
    const valueActual = actual[property as keyof Color];
    const valueExpected = expected[property as keyof TestColor];
    expect(valueActual, property).toBeCloseTo(valueExpected as number, digits);
  }
}

function expectTestColorRgbEqual(actual: Color, expected: TestColor) {
  expectTestColorEqual(actual, expected, ["red", "green", "blue"], 0);
}

function expectTestColorHslEqual(actual: Color, expected: TestColor) {
  if (actual.lightness > 0 && actual.lightness < 1) {
    if (actual.saturationL > 0) {
      expectTestColorEqual(actual, expected, ["hue"], 0);
    }
    expectTestColorEqual(actual, expected, ["saturationL"], 2);
  }
  expectTestColorEqual(actual, expected, ["lightness"], 2);
}

function expectTestColorHsvEqual(actual: Color, expected: TestColor) {
  if (actual.saturationV > 0) {
    expectTestColorEqual(actual, expected, ["hue"], 0);
  }
  expectTestColorEqual(actual, expected, ["saturationV", "value"], 2);
}

function expectTestColorAllEqual(actual: Color, expected: TestColor) {
  expectTestColorRgbEqual(actual, expected);
  expectTestColorHslEqual(actual, expected);
  expectTestColorHsvEqual(actual, expected);
}

test("constructs an empty Color", () => {
  const color = new Color();

  expect(color.red).toBeCloseTo(0);
  expect(color.green).toBeCloseTo(0);
  expect(color.blue).toBeCloseTo(0);
});

test.each(testColors)("constructs an RGB Color (%#)", (testColor) => {
  const color = Color.fromRgb(testColor.red, testColor.green, testColor.blue);

  expectTestColorRgbEqual(color, testColor);
});

test.each(testColors)("constructs an HSL Color (%#)", (testColor) => {
  const color = Color.fromHsl(testColor.hue, testColor.saturationL, testColor.lightness);

  expectTestColorHslEqual(color, testColor);
});

test.each(testColors)("constructs an HSV Color (%#)", (testColor) => {
  const color = Color.fromHsv(testColor.hue, testColor.saturationV, testColor.value);

  expectTestColorHsvEqual(color, testColor);
});

test.each(testColors)("constructs a hex Color (%#)", (testColor) => {
  const color = Color.fromHex(testColor.hex);

  expect(color).not.toBeNull();

  expectTestColorRgbEqual(color as Color, testColor);
});

test.each(testColors)("clones a Color (%#)", (testColor) => {
  const color = Color.fromRgb(testColor.red, testColor.green, testColor.blue);
  const newColor = color.clone();

  expectColorsEqual(newColor, color);
});

test.each(testColors)("converts colorspaces (%#)", (testColor) => {
  const color = Color.fromRgb(testColor.red, testColor.green, testColor.blue);

  expect(color.colorspace).toBe(Colorspace.RGB);

  const newColorHsl = color.adjustHsl(null, null, null);
  
  expect(newColorHsl.colorspace).toBe(Colorspace.HSL);
  expectColorPropertiesEqual(newColorHsl, color);
  expectTestColorHslEqual(newColorHsl, testColor);

  const newColorHsv = newColorHsl.adjustHsv(null, null, null);

  expect(newColorHsv.colorspace).toBe(Colorspace.HSV);
  expectColorPropertiesEqual(newColorHsv, newColorHsl);
  expectTestColorHsvEqual(newColorHsv, testColor);

  const newColorRgb = newColorHsl.adjustRgb(null, null, null);

  expect(newColorRgb.colorspace).toBe(Colorspace.RGB);
  expectColorPropertiesEqual(newColorRgb, newColorHsv);
  expectTestColorRgbEqual(newColorRgb, testColor);
});

test("adjusts color by RGB", () => {
  let colorA = new Color();
  let colorB = new Color();

  colorA = colorA.adjust(Channel.Red, 255);
  colorB = colorB.adjustRgb(255, null, null);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.Red]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.Red]);
  expect(colorA.colorspace).toBe(Colorspace.RGB);
  expect(colorB.colorspace).toBe(Colorspace.RGB);

  colorA = colorA.adjust(Channel.Green, 255);
  colorB = colorB.adjustRgb(null, 255, null);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.Yellow]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.Yellow]);

  colorA = colorA.adjust(Channel.Blue, 255);
  colorB = colorB.adjustRgb(null, null, 255);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.White]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.White]);
});

test("adjusts color by HSL", () => {
  let colorA = Color.fromHsl(0, 1, 0.5);
  let colorB = colorA.clone();

  colorA = colorA.adjust(Channel.HueL, 240);
  colorB = colorB.adjustHsl(240, null, null);
  expect(colorA.colorspace).toBe(Colorspace.HSL);
  expect(colorB.colorspace).toBe(Colorspace.HSL);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.Blue]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.Blue]);

  colorA = colorA.adjust(Channel.SaturationL, 0.5);
  colorB = colorB.adjustHsl(null, 0.5, null);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.DesaturatedBlue]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.DesaturatedBlue]);

  colorA = colorA.adjust(Channel.Lightness, 1);
  colorB = colorB.adjustHsl(null, null, 1);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.White]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.White]);
});

test("adjusts color by HSV", () => {
  let colorA = Color.fromHsv(0, 1, 1);
  let colorB = colorA.clone();

  colorA = colorA.adjust(Channel.HueV, 240);
  colorB = colorB.adjustHsv(240, null, null);
  expect(colorA.colorspace).toBe(Colorspace.HSV);
  expect(colorB.colorspace).toBe(Colorspace.HSV);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.Blue]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.Blue]);

  colorA = colorA.adjust(Channel.Value, 0.498);
  colorB = colorB.adjustHsv(null, null, 0.498);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.DarkBlue]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.DarkBlue]);

  colorA = colorA.adjust(Channel.SaturationV, 0);
  colorB = colorB.adjustHsv(null, 0, null);

  expectTestColorAllEqual(colorA, testColors[TestColorNames.Gray]);
  expectTestColorAllEqual(colorB, testColors[TestColorNames.Gray]);
});

test("maintains hue when adjusting HSL/HSV", () => {
  const initialColor = Color.fromHsl(260, 0.5, 0.5);
  let color = initialColor.clone();

  expect(color.hue).toBeCloseTo(260);

  color = initialColor.adjust(Channel.SaturationL, 0);
  expect(color.hue).toBeCloseTo(260);

  color = color.adjust(Channel.SaturationL, 1);
  expect(color.hue).toBeCloseTo(260);

  color = initialColor.adjust(Channel.Lightness, 0);
  expect(color.hue).toBeCloseTo(260);

  color = color.adjust(Channel.Lightness, 1);
  expect(color.hue).toBeCloseTo(260);

  color = color.adjust(Channel.Lightness, 0.5);
  expect(color.hue).toBeCloseTo(260);

  color = initialColor.adjust(Channel.SaturationV, 0);
  expect(color.hue).toBeCloseTo(260);

  color = color.adjust(Channel.SaturationV, 0.5);
  expect(color.hue).toBeCloseTo(260);

  color = initialColor.adjust(Channel.Value, 0);
  expect(color.hue).toBeCloseTo(260);

  color = color.adjust(Channel.Value, 0.5);
  expect(color.hue).toBeCloseTo(260);
});

test("handles hex strings correctly", () => {
  for (const name of testHexNames) {
    const color = Color.fromHex(name.hex);
    expect(color, name.hex).not.toBeNull();
    expect(color?.red, name.hex).toBeCloseTo(name.red);
    expect(color?.green, name.hex).toBeCloseTo(name.green);
    expect(color?.blue, name.hex).toBeCloseTo(name.blue);
  }
  for (const name of testBadHexNames) {
    const color = Color.fromHex(name);
    expect(color, name).toBeNull();
  }
});
