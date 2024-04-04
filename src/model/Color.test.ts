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

const testColors = [
  // grayscale

  {red: 0, green: 0, blue: 0,
    hue: 0, saturationL: 0, lightness: 0,
    saturationV: 0, value: 0}, // black
  {red: 255, green: 255, blue: 255,
    hue: 0, saturationL: 0, lightness: 1.0,
    saturationV: 0, value: 1.0}, // white
  {red: 127, green: 127, blue: 127,
    hue: 0, saturationL: 0, lightness: 0.498,
    saturationV: 0, value: 0.498}, // gray
  {red: 64, green: 64, blue: 64,
    hue: 0, saturationL: 0, lightness: 0.251,
    saturationV: 0, value: 0.251}, // dark gray
  {red: 191, green: 191, blue: 191,
    hue: 0, saturationL: 0, lightness: 0.749,
    saturationV: 0, value: 0.749}, // light gray

  // saturated colors

  {red: 255, green: 0, blue: 0,
    hue: 0, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // red
  {red: 255, green: 127, blue: 0,
    hue: 29.88, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // orange
  {red: 255, green: 255, blue: 0,
    hue: 60, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // yellow
  {red: 191, green: 255, blue: 0,
    hue: 75.06, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // lime
  {red: 0, green: 255, blue: 0,
    hue: 120, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // green
  {red: 0, green: 255, blue: 160,
    hue: 157.65, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // sea green
  {red: 0, green: 255, blue: 255,
    hue: 180, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // cyan
  {red: 0, green: 180, blue: 255,
    hue: 197.65, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // cool blue
  {red: 0, green: 0, blue: 255,
    hue: 240, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // blue
  {red: 127, green: 0, blue: 255,
    hue: 269.88, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // purple
  {red: 255, green: 0, blue: 255,
    hue: 300, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // magenta
  {red: 255, green: 0, blue: 160,
    hue: 322.35, saturationL: 1, lightness: 0.5,
    saturationV: 1, value: 1}, // hot pink

  // dark colors

  {red: 127, green: 0, blue: 0,
    hue: 0, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // red
  {red: 127, green: 64, blue: 0,
    hue: 30.24, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // orange
  {red: 127, green: 127, blue: 0,
    hue: 60, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // yellow
  {red: 96, green: 127, blue: 0,
    hue: 74.65, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // lime
  {red: 0, green: 127, blue: 0,
    hue: 120, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // green
  {red: 0, green: 127, blue: 80,
    hue: 157.8, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // sea green
  {red: 0, green: 127, blue: 127,
    hue: 180, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // cyan
  {red: 0, green: 90, blue: 127,
    hue: 197.48, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // cool blue
  {red: 0, green: 0, blue: 127,
    hue: 240, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // blue
  {red: 64, green: 0, blue: 127,
    hue: 270.24, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // purple
  {red: 127, green: 0, blue: 127,
    hue: 300, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // magenta
  {red: 127, green: 0, blue: 80,
    hue: 322.2, saturationL: 1, lightness: 0.249,
    saturationV: 1, value: 0.498}, // hot pink

  // desaturated colors

  {red: 191, green: 64, blue: 64,
    hue: 0, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // red
  {red: 191, green: 127, blue: 64,
    hue: 29.76, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // orange
  {red: 191, green: 191, blue: 64,
    hue: 60, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // yellow
  {red: 160, green: 191, blue: 64,
    hue: 74.65, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // lime
  {red: 64, green: 191, blue: 64,
    hue: 120, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // green
  {red: 64, green: 191, blue: 144,
    hue: 157.8, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // sea green
  {red: 64, green: 191, blue: 191,
    hue: 180, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // cyan
  {red: 64, green: 154, blue: 191,
    hue: 197.48, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // cool blue
  {red: 64, green: 64, blue: 191,
    hue: 240, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // blue
  {red: 127, green: 64, blue: 191,
    hue: 269.76, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // purple
  {red: 191, green: 64, blue: 191,
    hue: 300, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // magenta
  {red: 191, green: 64, blue: 144,
    hue: 322.2, saturationL: 0.498, lightness: 0.5,
    saturationV: 0.6649, value: 0.749}, // hot pink

  // pastel colors
  
  {red: 245, green: 163, blue: 163,
    hue: 0, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // red
  {red: 245, green: 204, blue: 163,
    hue: 30, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // orange
  {red: 245, green: 245, blue: 163,
    hue: 60, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // yellow
  {red: 224, green: 245, blue: 163,
    hue: 75.37, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // lime
  {red: 163, green: 245, blue: 163,
    hue: 120, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // green
  {red: 163, green: 245, blue: 214,
    hue: 157.32, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // sea green
  {red: 163, green: 245, blue: 245,
    hue: 180, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // cyan
  {red: 163, green: 221, blue: 245,
    hue: 197.56, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // cool blue
  {red: 163, green: 163, blue: 245,
    hue: 240, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // blue
  {red: 204, green: 163, blue: 245,
    hue: 270, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // purple
  {red: 245, green: 163, blue: 245,
    hue: 300, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // magenta
  {red: 245, green: 163, blue: 214,
    hue: 322.68, saturationL: 0.8039, lightness: 0.8,
    saturationV: 0.3347, value: 0.9608}, // hot pink
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

test.each(testColors)("constructs an RGB Color ($testColors)", (testColor) => {
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
