import { immerable } from "immer";

import { CelIndex, Palette } from "../Palette";
import { Calculation, CalculationResult } from "./Calculation";

export class CalcInterpolateStrip extends Calculation {
  [immerable] = true;

  static name(): string {
    return "Interpolate Strip";
  }
  static description(): string {
    return "Creates a gradient strip between two selected color cels.";
  }

  listDescription(): string {
    return `Interpolate Strip ${this.uid}`;
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
