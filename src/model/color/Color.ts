import Colorjs from "colorjs.io";
import hexRgb from "hex-rgb";
import rgbHex from "rgb-hex";

import { ColorRgb } from "./ColorRgb";
import { ColorHslv } from "./ColorHslv";
import { ColorLabch } from "./ColorLabch";
import { ColorOklabch } from "./ColorOklabch";

const clonedProperties = [
  "_rgb",
  "_hslv",
  "_labch",
  "_oklabch"
];

export interface Colorspace {
  clone(): ThisType<this>;
  channel(name: string): number;
  adjustChannel(channel: string, value: number): ThisType<this>;
  compute(converter: Colorjs): ThisType<this>;
  converter(): Colorjs;
}

class Color {
  private _rgb = ColorRgb.fromRaw(0, 0, 0);
  private _hslv = ColorHslv.fromHsl(0, 0, 0);
  private _labch = ColorLabch.fromLab(0, 0, 0);
  private _oklabch = ColorOklabch.fromOklab(0, 0, 0);
  private _hex: string = "#000000";

  get rgb() { return this._rgb; }
  get hslv() { return this._hslv; }
  get labch() { return this._labch; }
  get oklabch() { return this._oklabch; }
  get hex() { return this._hex; }

  clone(): Color {
    const color = new Color();

    for (const name of clonedProperties) {
      // @ts-expect-error tsc complains about incompatible properties that aren't being used if we try to type this
      color[name] = this[name].clone();
    }

    color._hex = `${this._hex}`;

    return color;
  }

  static fromRgb(newRgb: ColorRgb): Color {
    return new Color().withRgb(newRgb);
  }

  static fromHslv(newHslv: ColorHslv): Color {
    return new Color().withHslv(newHslv);
  }

  static fromLabch(newLabch: ColorLabch): Color {
    return new Color().withLabch(newLabch);
  }

  static fromOklabch(newOklabch: ColorOklabch): Color {
    return new Color().withOklabch(newOklabch);
  }

  static fromHex(hex: string): Color | null {
    return new Color().withHex(hex);
  }

  private _computeHex() {
    const [red, green, blue] = this.rgb.intNormalized();
    this._hex = "#" + rgbHex(red, green, blue);
  }

  withRgb(newRgb: ColorRgb): Color {
    const color = this.clone();
    const converter = newRgb.converter();

    color._rgb = newRgb;
    color._hslv = color._hslv.compute(converter);
    color._labch = color._labch.compute(converter);
    color._oklabch = color._oklabch.compute(converter);

    color._computeHex();

    return color;
  }

  withHslv(newHslv: ColorHslv): Color {
    const color = this.clone();
    const converter = newHslv.converter();

    color._rgb = color._rgb.compute(converter);
    color._hslv = newHslv;
    color._labch = color._labch.compute(converter);
    color._oklabch = color._oklabch.compute(converter);

    color._computeHex();

    return color;
  }

  withLabch(newLabch: ColorLabch): Color {
    const color = this.clone();
    const converter = newLabch.converter();

    color._rgb = color._rgb.compute(converter);
    color._hslv = color._hslv.compute(converter);
    color._labch = newLabch;
    color._oklabch = color._oklabch.compute(converter);

    color._computeHex();

    return color;
  }

  withOklabch(newOklabch: ColorOklabch): Color {
    const color = this.clone();
    const converter = newOklabch.converter();

    color._rgb = color._rgb.compute(converter);
    color._hslv = color._hslv.compute(converter);
    color._labch = color._labch.compute(converter);
    color._oklabch = newOklabch;

    color._computeHex();

    return color;
  }

  withHex(hex: string): Color | null {
    let rgb;

    try {
      rgb = hexRgb(hex);
    } catch (error) {
      return null;
    }

    return this.withRgb(ColorRgb.from(rgb.red, rgb.green, rgb.blue));
  }

  channel(colorspace: string, channel: string): number {
    switch (colorspace) {
      case "rgb":
        return this.rgb.channel(channel);
      case "hslv":
        return this.hslv.channel(channel);
      case "labch":
        return this.labch.channel(channel);
      case "oklabch":
        return this.oklabch.channel(channel);
      default:
        throw new Error("Bad colorspace");
    }
  }

  adjustChannel(colorspace: string, channel: string, value: number): Color {
    let newColorspace;

    switch (colorspace) {
      case "rgb":
        newColorspace = this.rgb.adjustChannel(channel, value);
        return this.withRgb(newColorspace);
      case "hslv":
        newColorspace = this.hslv.adjustChannel(channel, value);
        return this.withHslv(newColorspace);
      case "labch":
        newColorspace = this.labch.adjustChannel(channel, value);
        return this.withLabch(newColorspace);
      case "oklabch":
        newColorspace = this.oklabch.adjustChannel(channel, value);
        return this.withOklabch(newColorspace);
      default:
        throw new Error("Bad colorspace");
    }
  }
}

export default Color;
