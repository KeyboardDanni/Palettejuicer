import { immerable, produce } from "immer";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { NullableNumber, divideOrNull, fixArraySize, multiplyOrNull } from "../../util/math";

const CHANNEL_INFO: ChannelInfo[] = [
  {
    channel: "lightness",
    label: "L",
    channelType: ChannelType.IsLightness,
    range: [0, 1],
    rangeTransformed: [0, 100],
    step: 2,
  },
  {
    channel: "chroma",
    label: "C",
    channelType: ChannelType.IsChroma,
    range: [0, 0.4],
    rangeTransformed: [0, 40],
    step: 1,
  },
  { channel: "hue", label: "H", channelType: ChannelType.IsHue, range: [0, 360], rangeTransformed: [0, 360], step: 5 },
];

export class ColorspaceOklch extends Colorspace {
  [immerable] = true;

  get lightness() {
    return this.values[0];
  }
  get chroma() {
    return this.values[1];
  }
  get hue() {
    return this.values[2];
  }

  static colorspaceName(): string {
    return "oklch";
  }

  constructor(values?: NullableNumber[]) {
    super(fixArraySize(values ?? [], 3));
  }

  static rawToTransformed(raw: readonly NullableNumber[]): NullableNumber[] {
    return [multiplyOrNull(raw[0], 100), multiplyOrNull(raw[1], 100), raw[2]];
  }
  static transformedToRaw(transformed: readonly NullableNumber[]): NullableNumber[] {
    return [divideOrNull(transformed[0], 100), divideOrNull(transformed[1], 100), transformed[2]];
  }

  with(lightness: number, chroma: number, hue: number): ColorspaceOklch {
    return produce(this, (draft) => {
      draft.values = [lightness, chroma, hue];
    });
  }

  withTransformed(lightness: number, chroma: number, hue: number): ColorspaceOklch {
    return produce(this, (draft) => {
      draft.values = ColorspaceOklch.transformedToRaw([lightness, chroma, hue]);
    });
  }

  static channelInfo(): ChannelInfo[] {
    return CHANNEL_INFO;
  }
}
