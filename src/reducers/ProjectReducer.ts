import { Draft } from "immer";

import { PaletteAction, PaletteReducer } from "./PaletteReducer";
import { Project } from "../model/Project";

export const enum ProjectFileActionType {
  Clear,
  Set,
}

export interface ProjectFileActionArgs {}

export interface ProjectFileSetActionArgs extends ProjectFileActionArgs {
  project: Project;
}

export class ProjectFileAction {
  actionType!: ProjectFileActionType;
  args?: ProjectFileActionArgs;

  constructor(options: ProjectFileAction) {
    Object.assign(this, options);
  }
}

export type ProjectAction = ProjectFileAction | PaletteAction;

function ProjectFileReducer(_draft: Draft<Project>, action: ProjectFileAction) {
  let args;

  switch (action.actionType) {
    case ProjectFileActionType.Clear:
      return new Project();

    case ProjectFileActionType.Set:
      args = action.args as ProjectFileSetActionArgs;
      return args.project;

    default:
      throw new Error("Bad action type");
  }
}

export function ProjectReducer(draft: Draft<Project>, action: ProjectAction) {
  switch (action.constructor) {
    case ProjectFileAction:
      return ProjectFileReducer(draft, action as ProjectFileAction);

    case PaletteAction:
      return PaletteReducer(draft.palette, action as PaletteAction);

    default:
      throw new Error("Bad action");
  }
}
