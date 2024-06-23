import { immerable } from "immer";
import { CelIndex } from "../util/cel";

export enum PaletteToolType {
  Select = "select",
  Paint = "paint",
  FloodFill = "floodfill",
}

export class PaletteViewState {
  [immerable] = true;

  readonly activeIndex: CelIndex = { x: 0, y: 0 };
  readonly cursorIndex: CelIndex = { x: 0, y: 0 };
  readonly tool: PaletteToolType = PaletteToolType.Select;
}

export class ProjectViewState {
  [immerable] = true;

  readonly palette: PaletteViewState = new PaletteViewState();
  readonly activeCalcIndex: number = 0;
}
