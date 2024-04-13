import { v4 as uuidv4 } from "uuid";
import { immerable, produce } from "immer";

import { CelIndex, Palette } from "../Palette";
import { Color } from "../color/Color";

export interface CalculationCel {
  index: CelIndex;
  color: Color;
}

export interface CalculationResult {
  cels: CalculationCel[];
}

export abstract class Calculation {
  [immerable] = true;

  readonly uid: string;

  constructor() {
    this.uid = uuidv4();
  }

  withNewUid(): Calculation {
    return produce(this, (draft) => {
      draft.uid = uuidv4();
    });
  }

  static name(): string {
    return "Calculation";
  }
  static description(): string {
    return "";
  }
  abstract listDescription(): string;
  abstract affectedCels(): CelIndex[];
  abstract dependentCels(): CelIndex[];
  abstract computeColors(palette: Palette): CalculationResult;
}
