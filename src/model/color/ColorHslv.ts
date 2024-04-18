import { immerable, produce } from "immer";
import { Expose } from "class-transformer";
import Colorjs from "colorjs.io";

import { Colorspace, ColorspaceInfo } from "./Colorspace";

export class ColorHslv extends Colorspace {
  [immerable] = true;

  @Expose({ name: "hue" })
  private _hue: number = 0;
  @Expose({ name: "saturationL" })
  private _saturationL: number = 0;
  @Expose({ name: "lightness" })
  private _lightness: number = 0;
  @Expose({ name: "saturationV" })
  private _saturationV: number = 0;
  @Expose({ name: "value" })
  private _value: number = 0;

  get hue() { return this._hue; } // prettier-ignore
  get saturationL() { return this._saturationL; } // prettier-ignore
  get lightness() { return this._lightness; } // prettier-ignore
  get saturationV() { return this._saturationV; } // prettier-ignore
  get value() { return this._value; } // prettier-ignore

  static fromHsl(hue: number, saturationL: number, lightness: number): ColorHslv {
    const color = new ColorHslv();

    return color.adjustHsl(hue, saturationL, lightness);
  }

  static fromHsv(hue: number, saturationV: number, value: number): ColorHslv {
    const color = new ColorHslv();

    return color.adjustHsv(hue, saturationV, value);
  }

  channel(name: string): number {
    switch (name) {
      case "hueL":
        return this.hue;
      case "saturationL":
        return this.saturationL;
      case "lightness":
        return this.lightness;
      case "hueV":
        return this.hue;
      case "saturationV":
        return this.saturationV;
      case "value":
        return this.value;
      default:
        throw new Error("Bad channel");
    }
  }

  adjustChannel(channel: string, value: number): ColorHslv {
    switch (channel) {
      case "hueL":
        return this.adjustHsl(value, null, null);
      case "saturationL":
        return this.adjustHsl(null, value, null);
      case "lightness":
        return this.adjustHsl(null, null, value);
      case "hueV":
        return this.adjustHsv(value, null, null);
      case "saturationV":
        return this.adjustHsv(null, value, null);
      case "value":
        return this.adjustHsv(null, null, value);
      default:
        throw new Error("Bad channel");
    }
  }

  adjustHsl(hue: number | null, saturationL: number | null, lightness: number | null): ColorHslv {
    return produce(this, (draft: this) => {
      draft._hue = hue ?? this._hue;
      draft._saturationL = saturationL ?? this._saturationL;
      draft._lightness = lightness ?? this._lightness;

      const converter = new Colorjs("hsl", [draft._hue, draft._saturationL, draft._lightness]);
      [, draft._saturationV, draft._value] = converter.hsv;
    });
  }

  adjustHsv(hue: number | null, saturationV: number | null, value: number | null): ColorHslv {
    return produce(this, (draft: this) => {
      draft._hue = hue ?? this._hue;
      draft._saturationV = saturationV ?? this._saturationV;
      draft._value = value ?? this._value;

      const converter = new Colorjs("hsv", [draft._hue, draft._saturationV, draft._value]);
      [, draft._saturationL, draft._lightness] = converter.hsl;
    });
  }

  compute(converter: Colorjs): ColorHslv {
    const [hue, saturationL, lightness] = converter.hsl;

    return this.adjustHsl(!Number.isNaN(hue) ? hue : this._hue, saturationL, lightness);
  }

  converter(): Colorjs {
    return new Colorjs("hsv", [this._hue, this._saturationV, this._value]);
  }

  static colorspaceInfo(variant?: string): ColorspaceInfo {
    switch (variant) {
      case "hsl":
        return {
          colorspace: "hslv",
          channels: [
            { channel: "hueL", label: "H", range: [0, 360], step: 5 },
            { channel: "saturationL", label: "S", range: [0, 100], step: 2 },
            { channel: "lightness", label: "L", range: [0, 100], step: 2 },
          ],
        };
      case "hsv":
        return {
          colorspace: "hslv",
          channels: [
            { channel: "hueV", label: "H", range: [0, 360], step: 5 },
            { channel: "saturationV", label: "S", range: [0, 100], step: 2 },
            { channel: "value", label: "V", range: [0, 100], step: 2 },
          ],
        };
      default:
        throw new Error("Bad variant");
    }
  }
}
