import {
  to as colorjsTo,
  ColorObject,
  ColorSpace as ColorjsSpace,
  toGamut as colorjsToGamut,
  steps as colorjsSteps,
  sRGB,
  HSL,
  HSV,
  Lab,
  LCH,
  OKLab,
  OKLCH,
  Okhsl,
  Okhsv,
} from "colorjs.io/fn";

ColorjsSpace.register(sRGB);
ColorjsSpace.register(HSL);
ColorjsSpace.register(HSV);
ColorjsSpace.register(Lab);
ColorjsSpace.register(LCH);
ColorjsSpace.register(OKLab);
ColorjsSpace.register(OKLCH);
ColorjsSpace.register(Okhsl);
ColorjsSpace.register(Okhsv);

import { Colorspace } from "../model/color/Colorspace";
import { Color, availableSpaceNames } from "../model/color/Color";
import { produce } from "immer";

const spaceNameToColorjs: { [key: string]: string } = {
  rgb: "srgb",
};

const colorjsToSpaceName: { [key: string]: string } = {
  srgb: "rgb",
};

function spaceToColorjs(colorspace: Colorspace): ColorObject {
  const spaceClass = colorspace.constructor as typeof Colorspace;
  const spaceName = spaceClass.colorspaceName();
  const colorjsSpaceName = spaceNameToColorjs[spaceName] ?? spaceName;

  return {
    space: colorjsSpaceName,
    coords: [colorspace.values[0], colorspace.values[1], colorspace.values[2]],
  };
}

function colorjsToSpace(colorObject: ColorObject): Colorspace {
  const colorjsSpace = (((colorObject.space as ColorjsSpace).id as string) ?? colorObject.space).toLowerCase();
  const spaceName = colorjsToSpaceName[colorjsSpace] ?? colorjsSpace;
  const spaceClass = availableSpaceNames[spaceName] as any;
  const color = new spaceClass(colorObject.coords);

  return color;
}

export function spaceToSpace(colorspace: Colorspace, newSpaceName: string): Colorspace {
  const converter = spaceToColorjs(colorspace);
  const space = spaceNameToColorjs[newSpaceName] ?? newSpaceName;
  const converted = colorjsTo(converter, space);

  return colorjsToSpace(converted);
}

export function spaceToSpaceValues(values: number[], oldSpaceName: string, newSpaceName: string): number[] {
  const oldColorJsSpace = spaceNameToColorjs[oldSpaceName] ?? oldSpaceName;
  const newColorJsSpace = spaceNameToColorjs[newSpaceName] ?? newSpaceName;
  const converter: ColorObject = {
    space: oldColorJsSpace,
    coords: [values[0], values[1], values[2]],
  };
  const converted = colorjsTo(converter, newColorJsSpace);

  return converted.coords;
}

export function toGamut(colorspace: Colorspace, algorithm: string): Colorspace {
  const source = spaceToColorjs(colorspace);
  const inGamut = colorjsToGamut(source, { space: "srgb", method: algorithm });

  return produce(colorspace, (draft) => {
    draft.values = inGamut.coords;
  });
}

export type StepProperties = {
  colorspace: string;
  numSteps: number;
  hueMode: "longer" | "shorter" | "increasing" | "decreasing" | "raw";
  powerCurve: number;
};

export function colorSteps(startColor: Color, endColor: Color, props: StepProperties) {
  const start = spaceToColorjs(startColor.data);
  const end = spaceToColorjs(endColor.data);

  const steps = colorjsSteps(start, end, {
    steps: props.numSteps,
    space: props.colorspace,
    hue: props.hueMode,
    progression: (p) => Math.pow(p, props.powerCurve),
  });

  return steps.map((step) => new Color(colorjsToSpace(step)));
}
