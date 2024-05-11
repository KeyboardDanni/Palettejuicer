import { immerable, produce } from "immer";
import hexRgb from "hex-rgb";
import rgbHex from "rgb-hex";

import { ChannelInfo, Colorspace, ChannelType } from "./Colorspace";
import { clamp, fixArraySize, outOfRange } from "../../util/math";

export const GAMUT_ROUNDING_ERROR = 0.0001;

const MAX_HEX_LENGTH = 16;

const CHANNEL_INFO: ChannelInfo[] = [
  { channel: "red", label: "R", channelType: ChannelType.None, range: [0, 255], step: 5 },
  { channel: "green", label: "G", channelType: ChannelType.None, range: [0, 255], step: 5 },
  { channel: "blue", label: "B", channelType: ChannelType.None, range: [0, 255], step: 5 },
];

export class ColorspaceRgb extends Colorspace {
  [immerable] = true;

  get red() {
    return this.values[0];
  }
  get green() {
    return this.values[1];
  }
  get blue() {
    return this.values[2];
  }
  get hex() {
    const [redNormal, greenNormal, blueNormal] = this.intNormalized();

    return "#" + rgbHex(redNormal, greenNormal, blueNormal);
  }

  static colorspaceName(): string {
    return "rgb";
  }

  constructor(values?: number[]) {
    super(fixArraySize(values ?? [], 3));
  }

  static fromHex(hex: string) {
    // Prevent huge input strings from causing stalls
    if (hex.length > MAX_HEX_LENGTH) return null;

    let rgb;

    try {
      rgb = hexRgb(hex);
    } catch (error) {
      return null;
    }

    return new ColorspaceRgb([rgb.red / 255, rgb.green / 255, rgb.blue / 255]);
  }

  static rawToTransformed(raw: readonly number[]): number[] {
    return raw.map((rawValue) => rawValue * 255);
  }
  static transformedToRaw(transformed: readonly number[]): number[] {
    return transformed.map((transformedValue) => transformedValue / 255);
  }

  with(red: number, green: number, blue: number): ColorspaceRgb {
    return produce(this, (draft) => {
      draft.values = [red, green, blue];
    });
  }

  withTransformed(red: number, green: number, blue: number): ColorspaceRgb {
    return produce(this, (draft) => {
      draft.values = ColorspaceRgb.transformedToRaw([red, green, blue]);
    });
  }

  inGamut(): boolean {
    return this.outOfGamutDistance() <= GAMUT_ROUNDING_ERROR;
  }

  outOfGamutDistance(): number {
    let distance = 0;

    for (let i = 0; i < 3; i++) {
      distance = Math.max(distance, outOfRange(this.values[i], 0, 1));
    }

    return distance;
  }

  intNormalized() {
    const red = clamp(Math.round(this.red * 255), 0, 255);
    const green = clamp(Math.round(this.green * 255), 0, 255);
    const blue = clamp(Math.round(this.blue * 255), 0, 255);

    return [red, green, blue];
  }

  static channelInfo(): ChannelInfo[] {
    return CHANNEL_INFO;
  }
}
