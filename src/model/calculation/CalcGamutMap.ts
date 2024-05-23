import { immerable, produce } from "immer";
import { Transform } from "class-transformer";

import { CelIndex } from "../../util/cel";
import { Color, GamutMapAlgorithm } from "../color/Color";
import { Calculation, CalculationCel, CalculationResult, CalcPropertiesViewProps } from "./Calculation";
import { CalcGamutMapView } from "../../widgets/calculations/CalcGamutMapView";

export class CalcGamutMap extends Calculation {
  [immerable] = true;

  readonly fullRange: boolean = true;
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
    const range = this.fullRange
      ? "Full range"
      : `[${this.startCel.x}, ${this.startCel.y}] to [${this.endCel.x}, ${this.endCel.y}]`;

    return "Gamut Map to sRGB - " + range;
  }

  inputCels(dimensions: [number, number]): CelIndex[] {
    const cels = [];
    let [start, end] = [this.startCel, this.endCel];

    if (this.fullRange) {
      start = { x: 0, y: 0 };
      end = { x: dimensions[0] - 1, y: dimensions[1] - 1 };
    }

    for (let y = start.y; y <= end.y; y++) {
      for (let x = start.x; x <= end.x; x++) {
        cels.push({ x, y });
      }
    }

    return cels;
  }

  outputCels(dimensions: [number, number]): CelIndex[] {
    return this.inputCels(dimensions);
  }

  computeColors(colors: Color[], dimensions: [number, number]): CalculationResult {
    const cels: CalculationCel[] = [];
    const outputs = this.outputCels(dimensions);

    for (const [i, color] of colors.entries()) {
      const mapped = color.toSrgbGamut(this.algorithm);

      cels.push({
        index: outputs[i],
        color: mapped,
      });
    }

    return { cels };
  }

  nudgeCelIndexes(offsetX: number, offsetY: number): Calculation {
    return produce(this, (draft) => {
      draft.startCel.x += offsetX;
      draft.startCel.y += offsetY;
      draft.endCel.x += offsetX;
      draft.endCel.y += offsetY;
    });
  }

  propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element {
    return CalcGamutMapView;
  }
}
