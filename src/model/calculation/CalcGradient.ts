import { immerable } from "immer";

import { CelIndex, Palette } from "../Palette";
import { Calculation, CalculationResult } from "./Calculation";

export class CalcGradient extends Calculation {
  [immerable] = true;

  description(): string {
    return `Gradient Strip ${this.uid}`;
  }

  affectedCels(): CelIndex[] {
    return [];
  }

  dependentCels(): CelIndex[] {
    return [];
  }

  computeColors(_palette: Palette): CalculationResult {
    // TODO
    throw new Error("Not implemented");

    return {
      cels: [],
    };
  }
}
