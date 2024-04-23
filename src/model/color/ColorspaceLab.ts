import { immerable, produce } from "immer";
import Colorjs from "colorjs.io";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { fixArraySize } from "../../util/math";

const CHANNEL_INFO: ChannelInfo[] = [
  { channel: "lightness", label: "L", channelType: ChannelType.IsLightness, range: [0, 100], step: 2 },
  { channel: "a", label: "A", channelType: ChannelType.None, range: [-125, 125], step: 5 },
  { channel: "b", label: "B", channelType: ChannelType.None, range: [-125, 125], step: 5 },
];

export class ColorspaceLab extends Colorspace {
  [immerable] = true;

  get lightness() {
    return this.values[0];
  }
  get a() {
    return this.values[1];
  }
  get b() {
    return this.values[2];
  }

  static colorspaceName(): string {
    return "lab";
  }

  constructor(values?: number[]) {
    super(fixArraySize(values ?? [], 3));
  }

  with(lightness: number, a: number, b: number): ColorspaceLab {
    return produce(this, (draft) => {
      draft.values = [lightness, a, b];
    });
  }

  compute(converter: Colorjs): ColorspaceLab {
    const [lightness, a, b] = converter.lab;

    return this.with(lightness, a, b);
  }

  converter(): Colorjs {
    return new Colorjs("lab", [this.values[0], this.values[1], this.values[2]]);
  }

  static channelInfo(): ChannelInfo[] {
    return CHANNEL_INFO;
  }
}
