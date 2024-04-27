import { v4 as uuidv4 } from "uuid";
import { immerable, produce } from "immer";

import { CelIndex } from "../../util/cel";
import { Color } from "../color/Color";
import { CalcPropertiesViewProps } from "../../widgets/PropertiesView";

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
  abstract propertiesView(): (props: CalcPropertiesViewProps) => JSX.Element;
}
