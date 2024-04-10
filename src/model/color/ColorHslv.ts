import Colorjs from "colorjs.io";

import { Colorspace } from "./Color";

export class ColorHslv implements Colorspace {
  private _hue: number;
  private _saturationL: number;
  private _lightness: number;
  private _saturationV: number;
  private _value: number;

  get hue() { return this._hue; } // prettier-ignore
  get saturationL() { return this._saturationL; } // prettier-ignore
  get lightness() { return this._lightness; } // prettier-ignore
  get saturationV() { return this._saturationV; } // prettier-ignore
  get value() { return this._value; } // prettier-ignore

  private constructor(hue: number, saturationL: number, lightness: number, saturationV: number, value: number) {
    this._hue = hue;
    this._saturationL = saturationL;
    this._lightness = lightness;
    this._saturationV = saturationV;
    this._value = value;
  }

  static fromHsl(hue: number, saturationL: number, lightness: number): ColorHslv {
    const hsl = new ColorHslv(hue, saturationL, lightness, 0, 0);

    return hsl.computeFromHsl();
  }

  static fromHsv(hue: number, saturationV: number, value: number): ColorHslv {
    const hsv = new ColorHslv(hue, 0, 0, saturationV, value);

    return hsv.computeFromHsv();
  }

  clone(): ColorHslv {
    return new ColorHslv(this._hue, this._saturationL, this._lightness, this._saturationV, this._value);
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
    const hsl = new ColorHslv(hue ?? this._hue, saturationL ?? this._saturationL, lightness ?? this._lightness, 0, 0);

    return hsl.computeFromHsl();
  }

  adjustHsv(hue: number | null, saturationV: number | null, value: number | null): ColorHslv {
    const hsv = new ColorHslv(hue ?? this._hue, 0, 0, saturationV ?? this._saturationV, value ?? this._value);

    return hsv.computeFromHsv();
  }

  compute(converter: Colorjs): ColorHslv {
    const [hue, saturationL, lightness] = converter.hsl;
    const [, saturationV, value] = converter.hsv;

    return new ColorHslv(!Number.isNaN(hue) ? hue : this._hue, saturationL, lightness, saturationV, value);
  }

  computeFromHsl(): ColorHslv {
    const converter = new Colorjs("hsl", [this._hue, this._saturationL, this._lightness]);
    const [, saturationV, value] = converter.hsv;

    return new ColorHslv(this._hue, this._saturationL, this._lightness, saturationV, value);
  }

  computeFromHsv(): ColorHslv {
    const converter = new Colorjs("hsv", [this._hue, this._saturationV, this._value]);
    const [, saturationL, lightness] = converter.hsl;

    return new ColorHslv(this._hue, saturationL, lightness, this._saturationV, this._value);
  }

  converter(): Colorjs {
    return new Colorjs("hsv", [this._hue, this._saturationV, this._value]);
  }
}
