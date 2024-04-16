import Colorjs from "colorjs.io";

export interface ChannelData {
  channel: string;
  label: string;
  range: [number, number];
  step: number;
}

export interface ColorspaceInfo {
  colorspace: string;
  channels: readonly ChannelData[];
}

export abstract class Colorspace {
  abstract channel(name: string): number;
  abstract adjustChannel(channel: string, value: number): ThisType<this>;
  abstract compute(converter: Colorjs): ThisType<this>;
  abstract converter(): Colorjs;
  static colorspaceInfo(variant?: string): ColorspaceInfo {
    return { colorspace: variant ?? "null", channels: [] };
  }
}
