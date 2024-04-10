import Colorjs from "colorjs.io";

import { Colorspace } from "./Color";

export class ColorOklabch implements Colorspace {
  private _lightness: number;
  private _a: number;
  private _b: number;
  private _chroma: number;
  private _hue: number;

  get lightness() { return this._lightness; } // prettier-ignore
  get a() { return this._a; } // prettier-ignore
  get b() { return this._b; } // prettier-ignore
  get chroma() { return this._chroma; } // prettier-ignore
  get hue() { return this._hue; } // prettier-ignore

  private constructor(lightness: number, a: number, b: number, chroma: number, hue: number) {
    this._lightness = lightness;
    this._a = a;
    this._b = b;
    this._chroma = chroma;
    this._hue = hue;
  }

  static fromOklab(lightness: number, a: number, b: number): ColorOklabch {
    const lab = new ColorOklabch(lightness, a, b, 0, 0);

    return lab.computeFromOklab();
  }

  static fromOklch(lightness: number, chroma: number, hue: number): ColorOklabch {
    const lch = new ColorOklabch(lightness, 0, 0, chroma, hue);

    return lch.computeFromOklch();
  }

  clone(): ColorOklabch {
    return new ColorOklabch(this._lightness, this._a, this._b, this._chroma, this._hue);
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

  adjustChannel(channel: string, value: number): ColorOklabch {
    switch (channel) {
      case "lightnessLab":
        return this.adjustOklab(value, null, null);
      case "a":
        return this.adjustOklab(null, value, null);
      case "b":
        return this.adjustOklab(null, null, value);
      case "lightnessLch":
        return this.adjustOklch(value, null, null);
      case "chroma":
        return this.adjustOklch(null, value, null);
      case "hue":
        return this.adjustOklch(null, null, value);
      default:
        throw new Error("Bad channel");
    }
  }

  adjustOklab(lightness: number | null, a: number | null, b: number | null): ColorOklabch {
    const lab = new ColorOklabch(lightness ?? this._lightness, a ?? this._a, b ?? this._b, 0, 0);

    return lab.computeFromOklab();
  }

  adjustOklch(lightness: number | null, chroma: number | null, hue: number | null): ColorOklabch {
    const lch = new ColorOklabch(lightness ?? this._lightness, 0, 0, chroma ?? this._chroma, hue ?? this._hue);

    return lch.computeFromOklch();
  }

  compute(converter: Colorjs): ColorOklabch {
    const [lightness, a, b] = converter.oklab;
    const [, chroma, hue] = converter.oklch;

    return new ColorOklabch(lightness * 100, a * 100, b * 100, chroma * 100, !Number.isNaN(hue) ? hue : this._hue);
  }

  computeFromOklab(): ColorOklabch {
    const converter = new Colorjs("oklab", [this._lightness / 100, this._a / 100, this._b / 100]);
    const [, chroma, hue] = converter.oklch;

    return new ColorOklabch(this._lightness, this._a, this._b, chroma * 100, !Number.isNaN(hue) ? hue : this._hue);
  }

  computeFromOklch(): ColorOklabch {
    const converter = new Colorjs("oklch", [this._lightness / 100, this._chroma / 100, this._hue]);
    const [, a, b] = converter.oklab;

    return new ColorOklabch(this._lightness, a * 100, b * 100, this._chroma, this._hue);
  }

  converter(): Colorjs {
    return new Colorjs("oklab", [this._lightness / 100, this._a / 100, this._b / 100]);
  }
}
