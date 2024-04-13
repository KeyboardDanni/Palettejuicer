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

  abstract description(): string;
  abstract affectedCels(): CelIndex[];
  abstract dependentCels(): CelIndex[];
  abstract computeColors(palette: Palette): CalculationResult;
}
