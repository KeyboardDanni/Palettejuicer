import { Draft } from "immer";

import { PaletteAction, PaletteReducer } from "./PaletteReducer";
import { Project } from "../model/Project";

class FooAction {}

export type ProjectAction = PaletteAction | FooAction;

export function ProjectReducer(draft: Draft<Project>, action: ProjectAction) {
  switch (action.constructor) {
    case PaletteAction:
      PaletteReducer(draft.palette, action as PaletteAction);
      break;
    default:
      throw new Error("Bad action");
  }
}
