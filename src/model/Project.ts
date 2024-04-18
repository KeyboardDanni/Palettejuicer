import { immerable } from "immer";

import { Palette } from "./Palette";
import { Type } from "class-transformer";

const PROJECT_VERSION = 1;

export class Project {
  [immerable] = true;

  readonly version: number;
  @Type(() => Palette)
  readonly palette: Palette;

  constructor() {
    this.version = PROJECT_VERSION;
    this.palette = new Palette();
  }
}
