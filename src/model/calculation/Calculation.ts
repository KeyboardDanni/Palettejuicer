import { v4 as uuidv4 } from "uuid";
import { immerable, produce } from "immer";

import { CelIndex } from "../../util/cel";
import { Color } from "../color/Color";

export type CalcPropertiesViewProps = {
  calc: Calculation;
  onCalcChange: (calc: Calculation) => void;
};

export interface CalculationCel {
  index: CelIndex;
  color: Color | null;
}

export interface CalculationResult {
  cels: CalculationCel[];
}

export abstract class Calculation {
  [immerable] = true;

  readonly uid: string;
  readonly enabled: boolean = true;
  readonly customName: string = "";

  constructor() {
    this.uid = uuidv4();
  }

  withNewUid(): Calculation {
    return produce(this, (draft) => {
      draft.uid = uuidv4();
    });
  }

  static calcName(): string {
    return "Calculation";
  }
  static description(): string {
    return "";
  }
  abstract listDescription(): string;
  abstract inputCels(): CelIndex[];
  abstract outputCels(): CelIndex[];
  abstract computeColors(colors: Color[]): CalculationResult;
  abstract nudgeCelIndexes(offsetX: number, offsetY: number): Calculation;
  abstract propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element;
}
