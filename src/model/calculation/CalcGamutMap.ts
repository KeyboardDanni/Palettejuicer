import { immerable, produce } from "immer";
import { Transform } from "class-transformer";

import { CelIndex } from "../../util/cel";
import { Color, GamutMapAlgorithm } from "../color/Color";
import { Calculation, CalculationCel, CalculationResult, CalcPropertiesViewProps } from "./Calculation";
import { CalcGamutMapView } from "../../widgets/calculations/CalcGamutMapView";

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
