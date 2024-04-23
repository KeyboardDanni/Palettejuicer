import { immerable, produce } from "immer";
import Colorjs from "colorjs.io";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { fixArraySize, handleNaN } from "../../util/math";

const CHANNEL_INFO: ChannelInfo[] = [
  { channel: "hue", label: "H", channelType: ChannelType.IsHue, range: [0, 360], step: 5 },
  { channel: "saturation", label: "S", channelType: ChannelType.IsSaturation, range: [0, 100], step: 2 },
  { channel: "lightness", label: "L", channelType: ChannelType.IsLightness, range: [0, 100], step: 2 },
];

export class ColorspaceHsl extends Colorspace {
  [immerable] = true;

  get hue() {
    return this.values[0];
  }
  get saturation() {
    return this.values[1];
  }
  get lightness() {
    return this.values[2];
  }

  static colorspaceName(): string {
    return "hsl";
  }

  constructor(values?: number[]) {
    super(fixArraySize(values ?? [], 3));
  }

  with(hue: number, saturation: number, lightness: number): ColorspaceHsl {
    return produce(this, (draft) => {
      draft.values = [hue, saturation, lightness];
    });
  }

  compute(converter: Colorjs): ColorspaceHsl {
    const [hue, saturation, lightness] = converter.hsl;

    return this.with(handleNaN(hue, this.values[0]), saturation, lightness);
  }

  converter(): Colorjs {
    return new Colorjs("hsl", [this.values[0], this.values[1], this.values[2]]);
  }

  static channelInfo(): ChannelInfo[] {
    return CHANNEL_INFO;
  }
}
