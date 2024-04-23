import { immerable, produce } from "immer";
import Colorjs from "colorjs.io";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { fixArraySize, handleNaN } from "../../util/math";

const CHANNEL_INFO: ChannelInfo[] = [
  { channel: "lightness", label: "L", channelType: ChannelType.IsLightness, range: [0, 100], step: 2 },
  { channel: "chroma", label: "C", channelType: ChannelType.IsChroma, range: [0, 40], step: 1 },
  { channel: "hue", label: "H", channelType: ChannelType.IsHue, range: [0, 360], step: 5 },
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

  constructor(values?: number[]) {
    super(fixArraySize(values ?? [], 3));
  }

  static rawToTransformed(raw: readonly number[]): number[] {
    return [raw[0] * 100, raw[1] * 100, raw[2]];
  }
  static transformedToRaw(transformed: readonly number[]): number[] {
    return [transformed[0] / 100, transformed[1] / 100, transformed[2]];
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

  compute(converter: Colorjs): ColorspaceOklch {
    const [lightness, chroma, hue] = converter.oklch;

    return this.with(lightness, chroma, handleNaN(hue, this.values[2]));
  }

  converter(): Colorjs {
    return new Colorjs("oklch", [this.values[0], this.values[1], this.values[2]]);
  }

  static channelInfo(): ChannelInfo[] {
    return CHANNEL_INFO;
  }
}
