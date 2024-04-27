import { Draft, castDraft } from "immer";

import { Palette } from "../model/Palette";
import { CelIndex } from "../util/cel";
import { Calculation } from "../model/calculation/Calculation";
import { Color } from "../model/color/Color";

export const enum PaletteActionType {
  SetBaseColor,
  EnableCalculations,
  AddCalculation,
  CloneCalculation,
  RemoveCalculation,
  MoveCalculation,
  SetCalculation,
}

export interface PaletteActionArgs {}

export interface BooleanArgs extends PaletteActionArgs {
  enabled: boolean;
}

export interface IndexArgs extends PaletteActionArgs {
  index: number;
}

export interface SetBaseColorArgs extends PaletteActionArgs {
  index: CelIndex;
  color: Color;
}

export interface EnableCalculationsArgs extends BooleanArgs {}

export interface AddCalculationArgs extends PaletteActionArgs {
  index: number;
  calcClass: typeof Calculation;
}

export interface CloneCalculationArgs extends IndexArgs {}

export interface RemoveCalculationArgs extends IndexArgs {}

export interface MoveCalculationArgs extends PaletteActionArgs {
  index: number;
  newIndex: number;
}

export interface SetCalculationArgs extends PaletteActionArgs {
  index: number;
  calc: Calculation;
}

export class PaletteAction {
  actionType!: PaletteActionType;
  args!: PaletteActionArgs;

  constructor(options: PaletteAction) {
    Object.assign(this, options);
  }
}

function checkCalcIndex(draft: Draft<Palette>, calcIndex: number, isAdd: boolean = false) {
  const extra = isAdd ? 1 : 0;

  if (calcIndex < 0 || calcIndex >= draft.calculations.length + extra) {
    return false;
  }

  return true;
}

export function PaletteReducer(draft: Draft<Palette>, action: PaletteAction) {
  switch (action.actionType) {
    case PaletteActionType.SetBaseColor: {
      const args = action.args as SetBaseColorArgs;
      const offset = draft.indexToOffset(args.index);
      if (offset === null) return;

      draft.baseColors[offset] = castDraft(args.color);
      break;
    }

    case PaletteActionType.EnableCalculations: {
      const args = action.args as EnableCalculationsArgs;
      draft.useCalculations = args.enabled;
      break;
    }

    case PaletteActionType.AddCalculation: {
      const args = action.args as AddCalculationArgs;
      if (!checkCalcIndex(draft, args.index, true)) return;

      draft.calculations.splice(args.index, 0, new (args.calcClass as any)());
      break;
    }

    case PaletteActionType.CloneCalculation: {
      const args = action.args as CloneCalculationArgs;
      if (!checkCalcIndex(draft, args.index)) return;

      const cloned = draft.calculations[args.index].withNewUid();

      draft.calculations.splice(args.index + 1, 0, cloned);
      break;
    }

    case PaletteActionType.RemoveCalculation: {
      const args = action.args as RemoveCalculationArgs;
      if (!checkCalcIndex(draft, args.index)) return;

      draft.calculations.splice(args.index, 1);
      break;
    }

    case PaletteActionType.MoveCalculation: {
      const args = action.args as MoveCalculationArgs;
      if (!checkCalcIndex(draft, args.index) || !checkCalcIndex(draft, args.newIndex)) return;

      const [popped] = draft.calculations.splice(args.index, 1);
      draft.calculations.splice(args.newIndex, 0, popped);
      break;
    }

    case PaletteActionType.SetCalculation: {
      const args = action.args as SetCalculationArgs;
      if (!checkCalcIndex(draft, args.index)) return;

      draft.calculations[args.index] = args.calc;
      break;
    }

    default:
      throw new Error("Bad action type");
  }

  draft.computedColors = castDraft(draft.computeColors());
}
