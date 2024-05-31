import { immerable, produce } from "immer";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { NullableNumber, divideOrNull, fixArraySize, multiplyOrNull } from "../../util/math";

const CHANNEL_INFO: ChannelInfo[] = [
  { channel: "hue", label: "H", channelType: ChannelType.IsHue, range: [0, 360], rangeTransformed: [0, 360], step: 5 },
  {
    channel: "saturation",
    label: "S",
    channelType: ChannelType.IsSaturation,
    range: [0, 1],
    rangeTransformed: [0, 100],
    step: 2,
  },
  {
    channel: "lightness",
    label: "L",
    channelType: ChannelType.IsLightness,
    range: [0, 1],
    rangeTransformed: [0, 100],
    step: 2,
  },
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

  constructor(values?: NullableNumber[]) {
    super(fixArraySize(values ?? [], 3));
  }

  static rawToTransformed(raw: readonly NullableNumber[]): NullableNumber[] {
    return [raw[0], multiplyOrNull(raw[1], 100), multiplyOrNull(raw[2], 100)];
  }
  static transformedToRaw(transformed: readonly NullableNumber[]): NullableNumber[] {
    return [transformed[0], divideOrNull(transformed[1], 100), divideOrNull(transformed[2], 100)];
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
