import { immerable, produce } from "immer";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { fixArraySize } from "../../util/math";

const CHANNEL_INFO: ChannelInfo[] = [
  { channel: "hue", label: "H", channelType: ChannelType.IsHue, range: [0, 360], step: 5 },
  { channel: "saturation", label: "S", channelType: ChannelType.IsSaturation, range: [0, 100], step: 2 },
  { channel: "lightness", label: "L", channelType: ChannelType.IsLightness, range: [0, 100], step: 2 },
];

export class ColorspaceOkhsl extends Colorspace {
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
    return "okhsl";
  }

  constructor(values?: number[]) {
    super(fixArraySize(values ?? [], 3));
  }

  static rawToTransformed(raw: readonly number[]): number[] {
    return [raw[0], raw[1] * 100, raw[2] * 100];
  }
  static transformedToRaw(transformed: readonly number[]): number[] {
    return [transformed[0], transformed[1] / 100, transformed[2] / 100];
  }

  with(hue: number, saturation: number, lightness: number): ColorspaceOkhsl {
    return produce(this, (draft) => {
      draft.values = [hue, saturation, lightness];
    });
  }

  withTransformed(hue: number, saturation: number, lightness: number): ColorspaceOkhsl {
    return produce(this, (draft) => {
      draft.values = ColorspaceOkhsl.transformedToRaw([hue, saturation, lightness]);
    });
  }

  static channelInfo(): ChannelInfo[] {
    return CHANNEL_INFO;
  }
}
