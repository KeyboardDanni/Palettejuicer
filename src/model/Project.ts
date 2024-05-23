import { immerable } from "immer";

import { Palette } from "./Palette";
import { Type } from "class-transformer";

const PROJECT_VERSION = 3;

function migrateVersion1(data: any) {
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

  data.version = 2;
}

function migrateVersion2(data: any) {
  for (const calculation of data.palette.calculations) {
    if (calculation.calcType === "CalcGamutMap") {
      calculation.fullRange = false;
    }
  }

  data.version = 3;
}

export class Project {
  [immerable] = true;

  readonly version: number;
  @Type(() => Palette)
  readonly palette: Palette;

  constructor() {
    this.version = PROJECT_VERSION;
    this.palette = new Palette();
  }

  static _migrate(data: any) {
    switch (data.version) {
      case 1:
        migrateVersion1(data);
        break;
      case 2:
        migrateVersion2(data);
        break;
    }
  }
}
