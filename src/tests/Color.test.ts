import "reflect-metadata";

import { produce } from "immer";
import { expect, test } from "vitest";

import { Color, GamutMapAlgorithm, availableSpaces, gamutMapData } from "../model/color/Color";
import { testColors, TestColorNames } from "./data/TestColors";
import { ColorspaceRgb } from "../model/color/ColorspaceRgb";
import { ColorspaceHsl } from "../model/color/ColorspaceHsl";
import { ColorspaceHsv } from "../model/color/ColorspaceHsv";
import { ColorspaceLab } from "../model/color/ColorspaceLab";
import { ColorspaceLch } from "../model/color/ColorspaceLch";
import { ColorspaceOklab } from "../model/color/ColorspaceOklab";
import { ColorspaceOklch } from "../model/color/ColorspaceOklch";
import { Colorspace } from "../model/color/Colorspace";

const ROUNDING_ERROR = 0.001;
const CLOSE_TO_0 = 0 + ROUNDING_ERROR;
const CLOSE_TO_1 = 1 - ROUNDING_ERROR;

interface TestColor {
  red: number;
  green: number;
  blue: number;
  hue: number;
  saturationL: number;
  lightness: number;
  saturationV: number;
  value: number;
  labLightness: number;
  labA: number;
  labB: number;
  lchChroma: number;
  lchHue: number;
  oklabLightness: number;
  oklabA: number;
  oklabB: number;
  oklchChroma: number;
  oklchHue: number;
  hex: string;
}

function wrapDegreesIfClose(value: number) {
  if (value + ROUNDING_ERROR > 360) {
    return value - 360;
  }

  return value;
}

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

function expectNumericArraysClose(actual: readonly number[], expected: readonly number[]) {
  expect(actual.length).toBe(expected.length);

  for (const [i, value] of actual.entries()) {
    expect(value).toBeCloseTo(expected[i]);
  }
}

function expectColorsEqual(actual: Color, expected: Color) {
  const typeActual = actual.data.constructor as typeof Colorspace;
  const typeExpected = expected.data.constructor as typeof Colorspace;

  if (typeActual === typeExpected) {
    expectNumericArraysClose(actual.data.values, expected.data.values);
  } else {
    const actualA = actual.data;
    const expectedA = expected.converted(typeActual.colorspaceName()).data;

    const actualB = actual.converted(typeExpected.colorspaceName()).data;
    const expectedB = expected.data;

    expectNumericArraysClose(actualA.values, expectedA.values);
    expectNumericArraysClose(actualB.values, expectedB.values);
  }
}

function expectTestColorRgbEqual(actual: Color, expected: TestColor) {
  const rgb = actual.rgb;
  const [red, green, blue] = rgb.transformed();

  expect(red).toBeCloseTo(expected.red, 1);
  expect(green).toBeCloseTo(expected.green, 1);
  expect(blue).toBeCloseTo(expected.blue, 1);
  expect(rgb.hex).toBe(expected.hex);
}

function expectTestColorHslEqual(actual: Color, expected: TestColor) {
  const hsl = actual.hsl;

  if (hsl.lightness > CLOSE_TO_0 && hsl.lightness < CLOSE_TO_1) {
    if (hsl.saturation > CLOSE_TO_0) {
      expect(wrapDegreesIfClose(hsl.hue)).toBeCloseTo(wrapDegreesIfClose(expected.hue), 1);
    }
    expect(hsl.saturation).toBeCloseTo(expected.saturationL, 1);
  }
  expect(hsl.lightness).toBeCloseTo(expected.lightness, 1);
}

function expectTestColorHsvEqual(actual: Color, expected: TestColor) {
  const hsv = actual.hsv;

  if (hsv.saturation > CLOSE_TO_0) {
    expect(wrapDegreesIfClose(hsv.hue)).toBeCloseTo(wrapDegreesIfClose(expected.hue), 1);
  }
  expect(hsv.saturation).toBeCloseTo(expected.saturationV, 1);
  expect(hsv.value).toBeCloseTo(expected.value, 1);
}

function expectTestColorLabEqual(actual: Color, expected: TestColor) {
  const lab = actual.lab;

  expect(lab.lightness).toBeCloseTo(expected.labLightness, 1);
  expect(lab.a).toBeCloseTo(expected.labA, 1);
  expect(lab.b).toBeCloseTo(expected.labB), 1;
}

function expectTestColorLchEqual(actual: Color, expected: TestColor) {
  const lch = actual.lch;

  expect(lch.lightness).toBeCloseTo(expected.labLightness, 1);
  expect(lch.chroma).toBeCloseTo(expected.lchChroma, 1);

  if (lch.chroma > 0) {
    expect(wrapDegreesIfClose(lch.hue)).toBeCloseTo(wrapDegreesIfClose(expected.lchHue), 1);
  }
}

function expectTestColorOklabEqual(actual: Color, expected: TestColor) {
  const oklab = actual.oklab;
  const [lightness, a, b] = oklab.transformed();

  expect(lightness).toBeCloseTo(expected.oklabLightness, 1);
  expect(a).toBeCloseTo(expected.oklabA, 1);
  expect(b).toBeCloseTo(expected.oklabB, 1);
}

function expectTestColorOklchEqual(actual: Color, expected: TestColor) {
  const oklch = actual.oklch;
  const [lightness, chroma, hue] = oklch.transformed();

  expect(lightness).toBeCloseTo(expected.oklabLightness, 1);
  expect(chroma).toBeCloseTo(expected.oklchChroma, 1);

  if (chroma > 0) {
    expect(wrapDegreesIfClose(hue)).toBeCloseTo(wrapDegreesIfClose(expected.oklchHue), 1);
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
}

test("constructs an empty Color", () => {
  const color = new Color();

  expect(color.spaceName()).toBe("rgb");

  expectNumericArraysClose(color.data.values, [0, 0, 0]);
});

test.each(testColors)("constructs an RGB Color (%#)", (testColor) => {
  const color = new Color(ColorspaceRgb.fromTransformed([testColor.red, testColor.green, testColor.blue]));

  expectTestColorRgbEqual(color, testColor);
});

test.each(testColors)("constructs an HSL Color (%#)", (testColor) => {
  const color = new Color(new ColorspaceHsl([testColor.hue, testColor.saturationL, testColor.lightness]));

  expectTestColorHslEqual(color, testColor);
});

test.each(testColors)("constructs an HSV Color (%#)", (testColor) => {
  const color = new Color(new ColorspaceHsv([testColor.hue, testColor.saturationV, testColor.value]));

  expectTestColorHsvEqual(color, testColor);
});

test.each(testColors)("constructs a LAB Color (%#)", (testColor) => {
  const color = new Color(new ColorspaceLab([testColor.labLightness, testColor.labA, testColor.labB]));

  expectTestColorLabEqual(color, testColor);
});

test.each(testColors)("constructs an LCH Color (%#)", (testColor) => {
  const color = new Color(new ColorspaceLch([testColor.labLightness, testColor.lchChroma, testColor.lchHue]));

  expectTestColorLchEqual(color, testColor);
});

test.each(testColors)("constructs an OkLAB Color (%#)", (testColor) => {
  const color = new Color(
    ColorspaceOklab.fromTransformed([testColor.oklabLightness, testColor.oklabA, testColor.oklabB])
  );

  expectTestColorOklabEqual(color, testColor);
});

test.each(testColors)("constructs an OkLCH Color (%#)", (testColor) => {
  const color = new Color(
    ColorspaceOklch.fromTransformed([testColor.oklabLightness, testColor.oklchChroma, testColor.oklchHue])
  );

  expectTestColorOklchEqual(color, testColor);
});

test.each(testColors)("constructs a hex Color (%#)", (testColor) => {
  const color = Color.fromHex(testColor.hex);

  expect(color).not.toBeNull();

  expectTestColorRgbEqual(color as Color, testColor);
});

test.each(testColors)("converts colorspaces (%#)", (testColor) => {
  const colorRgb = new Color(new ColorspaceRgb().withTransformed(testColor.red, testColor.green, testColor.blue));
  const colorHsl = colorRgb.converted("hsl");
  const colorHsv = colorHsl.converted("hsv");
  const colorLab = colorHsv.converted("lab");
  const colorLch = colorLab.converted("lch");
  const colorOklab = colorLch.converted("oklab");
  const colorOklch = colorOklab.converted("oklch");
  const colorRgbAgain = colorOklch.converted("rgb");

  expectTestColorAllEqual(colorRgb, testColor);
  expectTestColorAllEqual(colorHsl, testColor);
  expectTestColorAllEqual(colorHsv, testColor);
  expectTestColorAllEqual(colorLab, testColor);
  expectTestColorAllEqual(colorLch, testColor);
  expectTestColorAllEqual(colorOklab, testColor);
  expectTestColorAllEqual(colorOklch, testColor);
  expectTestColorAllEqual(colorRgbAgain, testColor);
});

test("adjusts color by RGB", () => {
  const initialColor = new Color();

  let color = initialColor.with(ColorspaceRgb.fromTransformed([255, 0, 0]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Red]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Black]);

  color = color.with(ColorspaceRgb.fromTransformed([255, 255, 0]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Yellow]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Black]);

  color = color.with(ColorspaceRgb.fromTransformed([255, 255, 255]));
  expectTestColorAllEqual(color, testColors[TestColorNames.White]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Black]);

  color = color.with(ColorspaceRgb.fromTransformed([0, 255, 255]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Cyan]);

  color = color.with(ColorspaceRgb.fromTransformed([0, 0, 255]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Blue]);

  color = color.with(ColorspaceRgb.fromTransformed([0, 0, 0]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Black]);
  expectColorsEqual(color, initialColor);
});

test("adjusts color by HSL", () => {
  const initialColor = new Color(new ColorspaceHsl([0, 100, 50]));

  let color = initialColor.with(new ColorspaceHsl([240, 100, 50]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Blue]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Red]);

  color = color.with(new ColorspaceHsl([240, 49.8, 50]));
  expectTestColorAllEqual(color, testColors[TestColorNames.DesaturatedBlue]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Red]);

  color = color.with(new ColorspaceHsl([240, 49.8, 100]));
  expectTestColorAllEqual(color, testColors[TestColorNames.White]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Red]);
});

test("adjusts color by HSV", () => {
  const initialColor = new Color(new ColorspaceHsv([0, 100, 100]));

  let color = initialColor.with(new ColorspaceHsv([240, 100, 100]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Blue]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Red]);

  color = color.with(new ColorspaceHsv([240, 100, 49.8]));
  expectTestColorAllEqual(color, testColors[TestColorNames.DarkBlue]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Red]);

  color = color.with(new ColorspaceHsv([240, 0, 49.8]));
  expectTestColorAllEqual(color, testColors[TestColorNames.Gray]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Red]);
});

test("adjusts color by LAB", () => {
  const initialColor = new Color(new ColorspaceLab([0, 0, 0]));
  const testColor = testColors[TestColorNames.SeaGreen];

  const color = initialColor.with(new ColorspaceLab([testColor.labLightness, testColor.labA, testColor.labB]));

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Black]);
});

test("adjusts color by LCH", () => {
  const initialColor = new Color(new ColorspaceLch([0, 0, 0]));
  const testColor = testColors[TestColorNames.SeaGreen];

  const color = initialColor.with(new ColorspaceLch([testColor.labLightness, testColor.lchChroma, testColor.lchHue]));

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Black]);
});

test("adjusts color by OkLAB", () => {
  const initialColor = new Color(new ColorspaceOklab([0, 0, 0]));
  const testColor = testColors[TestColorNames.SeaGreen];

  const color = initialColor.with(
    ColorspaceOklab.fromTransformed([testColor.oklabLightness, testColor.oklabA, testColor.oklabB])
  );

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Black]);
});

test("adjusts color by OkLCH", () => {
  const initialColor = new Color(new ColorspaceOklch([0, 0, 0]));
  const testColor = testColors[TestColorNames.SeaGreen];

  const color = initialColor.with(
    ColorspaceOklch.fromTransformed([testColor.oklabLightness, testColor.oklchChroma, testColor.oklchHue])
  );

  expectTestColorAllEqual(color, testColors[TestColorNames.SeaGreen]);
  expectTestColorAllEqual(initialColor, testColors[TestColorNames.Black]);
});

test("maintains hue when adjusting HSL/HSV", () => {
  const initialColor = new Color(new ColorspaceHsl([260, 50, 50]));
  let color = initialColor;

  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsl([260, 0, 50]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsl([260, 100, 50]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsl([260, 100, 0]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsl([260, 100, 100]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsl([260, 100, 50]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsv([260, 0, 100]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsv([260, 50, 100]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsv([260, 50, 0]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);

  color = initialColor.with(new ColorspaceHsv([260, 50, 50]));
  expect(color.hsl.hue).toBeCloseTo(260);
  expect(color.hsv.hue).toBeCloseTo(260);
});

test("handles hex strings correctly", () => {
  for (const name of testHexNames) {
    const color = Color.fromHex(name.hex);
    expect(color, name.hex).not.toBeNull();

    const rgb = color!.rgb;
    const [red, green, blue] = rgb.transformed();

    expect(red, name.hex).toBeCloseTo(name.red);
    expect(green, name.hex).toBeCloseTo(name.green);
    expect(blue, name.hex).toBeCloseTo(name.blue);
  }
  for (const name of testBadHexNames) {
    const color = Color.fromHex(name);
    expect(color, name).toBeNull();
  }
});

test("moves color in-gamut correctly", () => {
  const lightSteps = [0, 75];
  const chromaSteps = [0, 75];
  const hueSteps = [0, 180];
  const colorspaces = availableSpaces.map((spaceClass) => spaceClass.colorspaceName());
  const algorithms = Object.values(GamutMapAlgorithm).filter(
    (value) => !Number.isNaN(Number(value))
  ) as GamutMapAlgorithm[];

  for (const light of lightSteps) {
    for (const chroma of chromaSteps) {
      for (const hue of hueSteps) {
        const baseColor = new Color(new ColorspaceLch([light, chroma, hue]));

        for (const space of colorspaces) {
          const converted = baseColor.converted(space);

          for (const algorithm of algorithms) {
            let expected = converted;

            if (!expected.rgb.inGamut()) {
              expected = produce(expected, (draft) => {
                const converter = draft.data.converter();
                const inGamut = converter.toGamut({ space: "srgb", method: gamutMapData[algorithm].algorithm });
                draft.data = draft.data.compute(inGamut) as any;
              });
            }

            const actual = converted.toSrgbGamut(algorithm) ?? converted;

            expectColorsEqual(actual, expected);
          }
        }
      }
    }
  }
});
