import { immerable } from "immer";

import { Palette } from "./Palette";
import { Type } from "class-transformer";

const PROJECT_VERSION = 3;

function migrateVersion1(data: any) {
  if (!data.palette) return;

  const TRANSFORM_COLORSPACE: { [key: string]: string } = {
    OkLch: "Lch",
    OkLab: "Lab",
    Lch: "OkLch",
    Lab: "OkLab",
  };

  for (const calculation of data.palette.calculations) {
    if (calculation.calcType === "CalcInterpolateStrip") {
      calculation.colorspace = TRANSFORM_COLORSPACE[calculation.colorspace];
    }
  }
}

function migrateVersion2(data: any) {
  if (!data.palette) return;

  for (const calculation of data.palette.calculations) {
    if (calculation.calcType === "CalcGamutMap") {
      calculation.fullRange = false;
    }
  }
}

export class Project {
  [immerable] = true;

  readonly version: number;
  @Type(() => Palette)
  readonly palette: Palette | null;

  constructor() {
    this.version = PROJECT_VERSION;
    this.palette = null;
  }

  static _migrate(data: any) {
    while (data.version < PROJECT_VERSION) {
      switch (data.version) {
        case 1:
          migrateVersion1(data);
          break;
        case 2:
          migrateVersion2(data);
          break;
      }

      data.version++;
    }
  }
}
