import Colorjs from "colorjs.io";

import { Colorspace } from "./Color";

export class ColorLabch implements Colorspace {
  private _lightness: number;
  private _a: number;
  private _b: number;
  private _chroma: number;
  private _hue: number;

  get lightness() { return this._lightness; }
  get a() { return this._a; }
  get b() { return this._b; }
  get chroma() { return this._chroma; }
  get hue() { return this._hue; }

  private constructor(lightness: number, a: number, b: number, chroma: number, hue: number) {
    this._lightness = lightness;
    this._a = a;
    this._b = b;
    this._chroma = chroma;
    this._hue = hue;
  }

  static fromLab(lightness: number, a: number, b: number): ColorLabch {
    const lab = new ColorLabch(lightness, a, b, 0, 0);

    return lab.computeFromLab();
  }

  static fromLch(lightness: number, chroma: number, hue: number): ColorLabch {
    const lch = new ColorLabch(lightness, 0, 0, chroma, hue);

    return lch.computeFromLch();
  }

  clone(): ColorLabch {
    return new ColorLabch(this._lightness, this._a, this._b, this._chroma, this._hue);
  }

  channel(name: string): number {
    switch (name) {
      case "lightnessLab":
        return this.lightness;
      case "a":
        return this.a;
      case "b":
        return this.b;
      case "lightnessLch":
        return this.lightness;
      case "chroma":
        return this.chroma;
      case "hue":
        return this.hue;
      default:
        throw new Error("Bad channel");
    }
  }

  adjustChannel(channel: string, value: number): ColorLabch {
    switch (channel) {
      case "lightnessLab":
        return this.adjustLab(value, null, null);
      case "a":
        return this.adjustLab(null, value, null);
      case "b":
        return this.adjustLab(null, null, value);
      case "lightnessLch":
        return this.adjustLch(value, null, null);
      case "chroma":
        return this.adjustLch(null, value, null);
      case "hue":
        return this.adjustLch(null, null, value);
      default:
        throw new Error("Bad channel");
    }
  }
  
  adjustLab(lightness: number | null, a: number | null, b: number | null): ColorLabch {
    const lab = new ColorLabch(lightness ?? this._lightness, a ?? this._a, b ?? this._b, 0, 0);

    return lab.computeFromLab();
  }

  adjustLch(lightness: number | null, chroma: number | null, hue: number | null): ColorLabch {
    const lch = new ColorLabch(lightness ?? this._lightness, 0, 0, chroma ?? this._chroma, hue ?? this._hue);

    return lch.computeFromLch();
  }

  compute(converter: Colorjs): ColorLabch {
    const [lightness, a, b] = converter.lab;
    const [, chroma, hue] = converter.lch;

    return new ColorLabch(lightness, a, b, chroma, !Number.isNaN(hue) ? hue : this._hue);
  }

  computeFromLab(): ColorLabch {
    const converter = new Colorjs("lab", [this._lightness, this._a, this._b]);
    const [, chroma, hue] = converter.lch;

    return new ColorLabch(this._lightness, this._a, this._b, chroma, !Number.isNaN(hue) ? hue : this._hue);
  }

  computeFromLch(): ColorLabch {
    const converter = new Colorjs("lch", [this._lightness, this._chroma, this._hue]);
    const [, a, b] = converter.lab;

    return new ColorLabch(this._lightness, a, b, this._chroma, this._hue);
  }

  converter(): Colorjs {
    return new Colorjs("lab", [this._lightness, this._a, this._b]);
  }
}
