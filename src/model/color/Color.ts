import { immerable, produce } from "immer";
import { Expose, Type } from "class-transformer";

import { ColorRgb } from "./ColorRgb";
import { ColorHslv } from "./ColorHslv";
import { ColorLabch } from "./ColorLabch";
import { ColorOklabch } from "./ColorOklabch";
import { ColorspaceInfo } from "./Colorspace";

const DEFAULT_RGB = ColorRgb.fromRaw(0, 0, 0);
const DEFAULT_HSLV = ColorHslv.fromHsl(0, 0, 0);
const DEFAULT_LABCH = ColorLabch.fromLab(0, 0, 0);
const DEFAULT_OKLABCH = ColorOklabch.fromOklab(0, 0, 0);

export class Color {
  [immerable] = true;

  @Expose({ name: "rgb" })
  @Type(() => ColorRgb)
  private _rgb: ColorRgb = DEFAULT_RGB;
  @Expose({ name: "hslv" })
  @Type(() => ColorHslv)
  private _hslv: ColorHslv = DEFAULT_HSLV;
  @Expose({ name: "labch" })
  @Type(() => ColorLabch)
  private _labch: ColorLabch = DEFAULT_LABCH;
  @Expose({ name: "oklabch" })
  @Type(() => ColorOklabch)
  private _oklabch: ColorOklabch = DEFAULT_OKLABCH;

  get rgb() { return this._rgb; } // prettier-ignore
  get hslv() { return this._hslv; } // prettier-ignore
  get labch() { return this._labch; } // prettier-ignore
  get oklabch() { return this._oklabch; } // prettier-ignore

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

  withRgb(newRgb: ColorRgb): Color {
    const converter = newRgb.converter();

    return produce(this, (draft: this) => {
      draft._rgb = newRgb;
      draft._hslv = draft._hslv.compute(converter);
      draft._labch = draft._labch.compute(converter);
      draft._oklabch = draft._oklabch.compute(converter);
    });
  }

  withHslv(newHslv: ColorHslv): Color {
    const converter = newHslv.converter();

    return produce(this, (draft: this) => {
      draft._rgb = draft._rgb.compute(converter);
      draft._hslv = newHslv;
      draft._labch = draft._labch.compute(converter);
      draft._oklabch = draft._oklabch.compute(converter);
    });
  }

  withLabch(newLabch: ColorLabch): Color {
    const converter = newLabch.converter();

    return produce(this, (draft: this) => {
      draft._rgb = draft._rgb.compute(converter);
      draft._hslv = draft._hslv.compute(converter);
      draft._labch = newLabch;
      draft._oklabch = draft._oklabch.compute(converter);
    });
  }

  withOklabch(newOklabch: ColorOklabch): Color {
    const converter = newOklabch.converter();

    return produce(this, (draft: this) => {
      draft._rgb = draft._rgb.compute(converter);
      draft._hslv = draft._hslv.compute(converter);
      draft._labch = draft._labch.compute(converter);
      draft._oklabch = newOklabch;
    });
  }

  withHex(hex: string): Color | null {
    const hexColor = ColorRgb.fromHex(hex);

    if (hexColor !== null) {
      return this.withRgb(hexColor);
    }

    return null;
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

  static colorspaceInfo(variant: string): ColorspaceInfo {
    switch (variant) {
      case "rgb":
        return ColorRgb.colorspaceInfo();
      case "hsl":
        return ColorHslv.colorspaceInfo("hsl");
      case "hsv":
        return ColorHslv.colorspaceInfo("hsv");
      case "lab":
        return ColorLabch.colorspaceInfo("lab");
      case "lch":
        return ColorLabch.colorspaceInfo("lch");
      case "oklab":
        return ColorOklabch.colorspaceInfo("oklab");
      case "oklch":
        return ColorOklabch.colorspaceInfo("oklch");
      default:
        throw new Error("Bad colorspace");
    }
  }
}
