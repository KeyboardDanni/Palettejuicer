import { immerable, produce } from "immer";
import { Transform } from "class-transformer";

import { CalcPropertiesViewProps } from "../../widgets/PropertiesView";
import { CelIndex } from "../../util/cel";
import { Color } from "../color/Color";
import { Calculation, CalculationCel, CalculationResult } from "./Calculation";
import { CalcGamutMapView } from "../../widgets/calculations/CalcGamutMapView";

export enum GamutMapAlgorithm {
  Css,
  LchC,
  Clipping,
}

type GamutMapAlgorithmItem = {
  readonly name: string;
  readonly algorithm: string;
  readonly description: string;
};

export const gamutMapData: readonly GamutMapAlgorithmItem[] = [
  { name: "CSS 4", algorithm: "css", description: "Uses the CSS 4 Gamut Mapping Algorithm." },
  { name: "LCH Chroma", algorithm: "lch.c", description: "Tries to lower the chroma until the color is in gamut." },
  { name: "Clipping", algorithm: "clip", description: "Simply clips colors to be in gamut. Not recommended." },
];

export class CalcGamutMap extends Calculation {
  [immerable] = true;

  readonly startCel: CelIndex = { x: 0, y: 0 };
  readonly endCel: CelIndex = { x: 0, y: 0 };
  @Transform((options) => GamutMapAlgorithm[options.value])
  readonly algorithm: GamutMapAlgorithm = GamutMapAlgorithm.Css;

  static calcName(): string {
    return "Gamut Map to sRGB";
  }

  static description(): string {
    return "Maps out-of-gamut colors to be within sRGB range.";
  }

  listDescription(): string {
    return `Gamut Map to sRGB - [${this.startCel.x}, ${this.startCel.y}] to [${this.endCel.x}, ${this.endCel.y}]`;
  }

  inputCels(): CelIndex[] {
    const cels = [];

    for (let y = this.startCel.y; y <= this.endCel.y; y++) {
      for (let x = this.startCel.x; x <= this.endCel.x; x++) {
        cels.push({ x, y });
      }
    }

    return cels;
  }

  outputCels(): CelIndex[] {
    return this.inputCels();
  }

  computeColors(colors: Color[]): CalculationResult {
    const cels: CalculationCel[] = [];
    const outputs = this.outputCels();

    for (const [i, color] of colors.entries()) {
      let mapped = null;

      if (!color.rgb.inGamut()) {
        mapped = produce(color, (draft) => {
          const converter = draft.data.converter();
          const inGamut = converter.toGamut({ space: "srgb", method: gamutMapData[this.algorithm].algorithm });
          draft.data = draft.data.compute(inGamut) as any;
        });
      }

      cels.push({
        index: outputs[i],
        color: mapped,
      });
    }

    return { cels };
  }

  propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element {
    return CalcGamutMapView;
  }
}
