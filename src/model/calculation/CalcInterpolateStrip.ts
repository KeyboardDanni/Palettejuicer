import { immerable } from "immer";

import { CelIndex, celStrip } from "../../util/cel";
import { Calculation, CalculationCel, CalculationResult } from "./Calculation";
import { CalcInterpolateStripView } from "../../widgets/calculations/CalcInterpolateStripView";
import { CalcPropertiesViewProps } from "../../widgets/PropertiesView";
import { Color } from "../color/Color";
import { Transform } from "class-transformer";
import { colorSteps } from "../../util/colorjs";

export enum LerpColorspace {
  OkLch,
  OkLab,
  Lch,
  Lab,
  OkHsl,
  OkHsv,
  Hsl,
  Hsv,
  Srgb,
}

type LerpColorspaceItem = {
  readonly name: string;
  readonly colorspace: string;
  readonly description: string;
};

export const lerpColorspaceData: readonly LerpColorspaceItem[] = [
  {
    name: "OkLCH",
    colorspace: "oklch",
    description: "Blends over hue, maintaining perceptual lightness. Uses the newer OkLAB colorspace.",
  },
  {
    name: "OkLAB",
    colorspace: "oklab",
    description: "Maintains perceptual lightness. Uses the newer OkLAB colorspace.",
  },
  {
    name: "LCH",
    colorspace: "lch",
    description: "Blends over hue, maintaining perceptual lightness. Good for making colors that pop.",
  },
  { name: "LAB", colorspace: "lab", description: "Maintains perceptual lightness. Good for earthy tones." },
  {
    name: "OkHSL",
    colorspace: "okhsl",
    description: "Maintains some perceptual lightness while staying inside the sRGB gamut.",
  },
  {
    name: "OkHSV",
    colorspace: "okhsv",
    description: "Maintains some perceptual lightness while staying inside the sRGB gamut.",
  },
  {
    name: "HSL",
    colorspace: "hsl",
    description: "Blends nicely over hue, but perceptual lightness will be inconsistent. Not recommended.",
  },
  {
    name: "HSV",
    colorspace: "hsv",
    description: "Blends nicely over hue, but perceptual lightness will be inconsistent. Not recommended.",
  },
  { name: "sRGB", colorspace: "srgb", description: "Blends over the standard RGB colorspace. Not recommended." },
];

export enum LerpHueMode {
  Shorter,
  Longer,
  Increasing,
  Decreasing,
  Raw,
}

type LerpHueModeItem = {
  readonly name: string;
  readonly mode: "longer" | "shorter" | "increasing" | "decreasing" | "raw";
  readonly description: string;
};

export const lerpHueModeData: readonly LerpHueModeItem[] = [
  { name: "Shorter", mode: "shorter", description: "Takes the shorter arc to the target hue." },
  { name: "Longer", mode: "longer", description: "Takes the longer arc to the target hue." },
  { name: "Increasing", mode: "increasing", description: "Increases in hue to the target." },
  { name: "Decreasing", mode: "decreasing", description: "Decreases in hue to the target." },
  { name: "Raw", mode: "raw", description: "Interpolates hue without wrapping degrees." },
];

export class CalcInterpolateStrip extends Calculation {
  [immerable] = true;

  readonly startCel: CelIndex = { x: 0, y: 0 };
  readonly endCel: CelIndex = { x: 0, y: 0 };
  @Transform((options) => LerpColorspace[options.value])
  readonly colorspace: LerpColorspace = LerpColorspace.OkLch;
  @Transform((options) => LerpHueMode[options.value])
  readonly hueMode: LerpHueMode = LerpHueMode.Shorter;
  readonly curve: number = 1;

  static calcName(): string {
    return "Interpolate Strip";
  }

  static description(): string {
    return "Creates a gradient strip between two selected color cels.";
  }

  listDescription(): string {
    return `Interpolate Strip - [${this.startCel.x}, ${this.startCel.y}] to [${this.endCel.x}, ${this.endCel.y}] over ${lerpColorspaceData[this.colorspace].name}`;
  }

  inputCels(): CelIndex[] {
    return [
      { x: this.startCel.x, y: this.startCel.y },
      { x: this.endCel.x, y: this.endCel.y },
    ];
  }

  outputCels(): CelIndex[] {
    const fullStrip = celStrip(this.startCel, this.endCel);

    return fullStrip.slice(1, -1);
  }

  computeColors(colors: Color[]): CalculationResult {
    const cels: CalculationCel[] = [];
    const indexes = this.outputCels();
    const startColor = colors[0];
    const endColor = colors[1];
    const colorspace = lerpColorspaceData[this.colorspace].colorspace;

    const steps = colorSteps(startColor, endColor, {
      numSteps: indexes.length + 2,
      colorspace,
      hueMode: lerpHueModeData[this.hueMode].mode,
      powerCurve: this.curve,
    });

    for (let i = 0; i < indexes.length; i++) {
      const step = steps[i + 1];

      cels.push({
        index: indexes[i],
        color: step,
      });
    }

    return { cels };
  }

  propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element {
    return CalcInterpolateStripView;
  }
}
