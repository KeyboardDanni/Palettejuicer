import { castDraft, immerable, produce } from "immer";
import { Type } from "class-transformer";

import { ChannelInfo, Colorspace } from "./Colorspace";
import { ColorspaceRgb } from "./ColorspaceRgb";
import { ColorspaceHsl } from "./ColorspaceHsl";
import { ColorspaceHsv } from "./ColorspaceHsv";
import { ColorspaceLch } from "./ColorspaceLch";
import { ColorspaceLab } from "./ColorspaceLab";
import { ColorspaceOklab } from "./ColorspaceOklab";
import { ColorspaceOklch } from "./ColorspaceOklch";

type AvailableColorspaceItem = {
  value: typeof Colorspace;
  name: string;
};

export const availableSpaces: (typeof Colorspace)[] = [
  ColorspaceRgb,
  ColorspaceHsl,
  ColorspaceHsv,
  ColorspaceLab,
  ColorspaceLch,
  ColorspaceOklab,
  ColorspaceOklch,
];

const availableSpaceClasses: { [key: string]: typeof Colorspace } = Object.fromEntries(
  availableSpaces.map((space) => [space.colorspaceName(), space])
);

const availableSpaceTypes: AvailableColorspaceItem[] = availableSpaces.map((space) => {
  return {
    name: space.colorspaceName(),
    value: space,
  };
});

export enum GamutMapAlgorithm {
  Css,
  LchC,
  Clipping,
}

type GamutMapAlgorithmItem = {
  readonly name: string;
  readonly algorithm: string;
  readonly description: string;
};

export const gamutMapData: readonly GamutMapAlgorithmItem[] = [
  { name: "CSS 4", algorithm: "css", description: "Uses the CSS 4 Gamut Mapping Algorithm." },
  { name: "LCH Chroma", algorithm: "lch.c", description: "Tries to lower the chroma until the color is in gamut." },
  { name: "Clipping", algorithm: "clip", description: "Simply clips colors to be in gamut. Not recommended." },
];

export class Color {
  [immerable] = true;

  @Type(() => Colorspace, {
    discriminator: {
      property: "space",
      subTypes: availableSpaceTypes as any,
    },
  })
  readonly data: Colorspace = new ColorspaceRgb();

  constructor(data?: Colorspace) {
    if (data !== undefined) {
      this.data = data;
    }
  }

  static fromHex(hex: string): Color | null {
    const space = ColorspaceRgb.fromHex(hex);

    if (space === null) {
      return null;
    }

    return new Color(space);
  }

  get rgb() { return this.data.converted(ColorspaceRgb); } // prettier-ignore
  get hsl() { return this.data.converted(ColorspaceHsl); } // prettier-ignore
  get hsv() { return this.data.converted(ColorspaceHsv); } // prettier-ignore
  get lab() { return this.data.converted(ColorspaceLab); } // prettier-ignore
  get lch() { return this.data.converted(ColorspaceLch); } // prettier-ignore
  get oklab() { return this.data.converted(ColorspaceOklab); } // prettier-ignore
  get oklch() { return this.data.converted(ColorspaceOklch); } // prettier-ignore
  get hex() { return this.rgb.hex; } // prettier-ignore

  spaceName(): string {
    const spaceClass = this.data.constructor as typeof Colorspace;

    return spaceClass.colorspaceName();
  }

  with(space: Colorspace): Color {
    const color = produce(this, (draft) => {
      draft.data = castDraft(space);
    });

    return color;
  }

  converted(spaceName: string): Color {
    const color = produce(this, (draft) => {
      const spaceClass = availableSpaceClasses[spaceName];
      const space = this.data.converted(spaceClass as any);

      draft.data = castDraft(space);
    });

    return color;
  }

  toSrgbGamut(algorithm: GamutMapAlgorithm): Color | null {
    if (this.rgb.inGamut()) return null;

    return produce(this, (draft) => {
      const converter = draft.data.converter();
      const inGamut = converter.toGamut({ space: "srgb", method: gamutMapData[algorithm].algorithm });
      draft.data = draft.data.compute(inGamut) as any;
    });
  }

  static channelInfo(spaceName: string): ChannelInfo[] {
    const spaceClass = availableSpaceClasses[spaceName];

    return spaceClass.channelInfo();
  }
}
