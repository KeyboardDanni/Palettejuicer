import { immerable, produce } from "immer";
import { Transform, Type } from "class-transformer";

import { CalcPropertiesViewProps } from "../../widgets/PropertiesView";
import { CelIndex, celStrip } from "../../util/cel";
import { Color } from "../color/Color";
import { Calculation, CalculationCel, CalculationResult } from "./Calculation";
import { CalcExtrapolateStripView } from "../../widgets/calculations/CalcExtrapolateStripView";
import { positiveMod, steps } from "../../util/math";
import { Colorspace } from "../color/Colorspace";

export enum ExtrapolateColorspace {
  OkLch,
  Lch,
}

type ExtrapolateColorspaceItem = {
  readonly name: string;
  readonly colorspace: string;
  readonly description: string;
};

export const extrapolateSpaceData: readonly ExtrapolateColorspaceItem[] = [
  {
    name: "OkLCH",
    colorspace: "oklch",
    description: "Blends over hue, maintaining perceptual lightness. Uses the newer OkLAB colorspace.",
  },
  {
    name: "LCH",
    colorspace: "lch",
    description: "Blends over hue, maintaining perceptual lightness. Good for making colors that pop.",
  },
];

export class StripAdjustment {
  [immerable] = true;

  readonly delta: number = 0;
  readonly curve: number = 1;
  readonly midBoost: number = 0;
  readonly midCurve: number = 1;

  valueAtStep(step: number): number {
    const power = Math.pow(Math.abs(step), this.curve) * Math.sign(step);
    const boostStep = Math.abs(step);
    const midPower = 1 - Math.pow(boostStep, this.midCurve);

    return this.delta * power + this.midBoost * midPower;
  }
}

export class CalcExtrapolateStrip extends Calculation {
  [immerable] = true;

  readonly inputCel: CelIndex = { x: 0, y: 0 };
  readonly startCel: CelIndex = { x: 0, y: 0 };
  readonly endCel: CelIndex = { x: 0, y: 0 };
  @Transform((options) => ExtrapolateColorspace[options.value])
  readonly colorspace: ExtrapolateColorspace = ExtrapolateColorspace.OkLch;
  @Type(() => StripAdjustment)
  readonly adjustLightness: StripAdjustment = new StripAdjustment();
  @Type(() => StripAdjustment)
  readonly adjustChroma: StripAdjustment = new StripAdjustment();
  @Type(() => StripAdjustment)
  readonly adjustHue: StripAdjustment = new StripAdjustment();

  static calcName(): string {
    return "Extrapolate Strip";
  }

  static description(): string {
    return "Creates a gradient strip by varying a single source color.";
  }

  listDescription(): string {
    return `Extrapolate Strip - [${this.inputCel.x}, ${this.inputCel.y}] over [${this.startCel.x}, ${this.startCel.y}] to [${this.endCel.x}, ${this.endCel.y}]`;
  }

  inputCels(): CelIndex[] {
    return [{ x: this.inputCel.x, y: this.inputCel.y }];
  }

  outputCels(): CelIndex[] {
    return celStrip(this.startCel, this.endCel);
  }

  computeColors(colors: Color[]): CalculationResult {
    const cels: CalculationCel[] = [];
    const indexes = this.outputCels();
    const numSteps = indexes.length;

    if (numSteps === 0) {
      return { cels: [] };
    }

    const sourceColor = colors[0].converted(extrapolateSpaceData[this.colorspace].colorspace);
    const progression = steps(-1, 1, numSteps);

    for (const [i, step] of progression.entries()) {
      const deltaLightness = this.adjustLightness.valueAtStep(step);
      const deltaChroma = this.adjustChroma.valueAtStep(step);
      const deltaHue = this.adjustHue.valueAtStep(step);

      const spaceClass = sourceColor.data.constructor as typeof Colorspace;
      const deltas = spaceClass.transformedToRaw([deltaLightness, deltaChroma, deltaHue]);

      const newColor = produce(sourceColor, (draft) => {
        draft.data.values[0] = sourceColor.data.values[0] + deltas[0];
        draft.data.values[1] = sourceColor.data.values[1] + deltas[1];
        draft.data.values[2] = positiveMod(sourceColor.data.values[2] + deltas[2], 360);
      });

      cels.push({
        index: indexes[i],
        color: newColor,
      });
    }

    return { cels };
  }

  propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element {
    return CalcExtrapolateStripView;
  }
}
