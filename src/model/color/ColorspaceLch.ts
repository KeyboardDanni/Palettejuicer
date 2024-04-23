import { immerable, produce } from "immer";
import Colorjs from "colorjs.io";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { fixArraySize, handleNaN } from "../../util/math";

const CHANNEL_INFO: ChannelInfo[] = [
  { channel: "lightness", label: "L", channelType: ChannelType.IsLightness, range: [0, 100], step: 2 },
  { channel: "chroma", label: "C", channelType: ChannelType.IsChroma, range: [0, 150], step: 5 },
  { channel: "hue", label: "H", channelType: ChannelType.IsHue, range: [0, 360], step: 5 },
];

export class ColorspaceLch extends Colorspace {
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
    return "lch";
  }

  constructor(values?: number[]) {
    super(fixArraySize(values ?? [], 3));
  }

  with(lightness: number, chroma: number, hue: number): ColorspaceLch {
    return produce(this, (draft) => {
      draft.values = [lightness, chroma, hue];
    });
  }

  compute(converter: Colorjs): ColorspaceLch {
    const [lightness, chroma, hue] = converter.lch;

    return this.with(lightness, chroma, handleNaN(hue, this.values[2]));
  }

  converter(): Colorjs {
    return new Colorjs("lch", [this.values[0], this.values[1], this.values[2]]);
  }

  static channelInfo(): ChannelInfo[] {
    return CHANNEL_INFO;
  }
}
