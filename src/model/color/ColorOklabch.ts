import { immerable, produce } from "immer";
import { Expose } from "class-transformer";
import Colorjs from "colorjs.io";

import { Colorspace, ColorspaceInfo } from "./Colorspace";

export class ColorOklabch extends Colorspace {
  [immerable] = true;

  @Expose({ name: "lightness" })
  private _lightness: number = 0;
  @Expose({ name: "a" })
  private _a: number = 0;
  @Expose({ name: "b" })
  private _b: number = 0;
  @Expose({ name: "chroma" })
  private _chroma: number = 0;
  @Expose({ name: "hue" })
  private _hue: number = 0;

  get lightness() { return this._lightness; } // prettier-ignore
  get a() { return this._a; } // prettier-ignore
  get b() { return this._b; } // prettier-ignore
  get chroma() { return this._chroma; } // prettier-ignore
  get hue() { return this._hue; } // prettier-ignore

  static fromOklab(lightness: number, a: number, b: number): ColorOklabch {
    const color = new ColorOklabch();

    return color.adjustOklab(lightness, a, b);
  }

  static fromOklch(lightness: number, chroma: number, hue: number): ColorOklabch {
    const color = new ColorOklabch();

    return color.adjustOklch(lightness, chroma, hue);
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
    return produce(this, (draft: this) => {
      draft._lightness = lightness ?? this._lightness;
      draft._a = a ?? this._a;
      draft._b = b ?? this._b;

      const converter = new Colorjs("oklab", [draft._lightness / 100, draft._a / 100, draft._b / 100]);
      const [, chroma, hue] = converter.oklch;
      draft._chroma = chroma * 100;
      draft._hue = !Number.isNaN(hue) ? hue : this._hue;
    });
  }

  adjustOklch(lightness: number | null, chroma: number | null, hue: number | null): ColorOklabch {
    return produce(this, (draft: this) => {
      draft._lightness = lightness ?? this._lightness;
      draft._chroma = chroma ?? this._chroma;
      draft._hue = hue !== null && !Number.isNaN(hue) ? hue : this._hue;

      const converter = new Colorjs("oklch", [draft._lightness / 100, draft._chroma / 100, draft._hue]);
      const [, a, b] = converter.oklab;
      draft._a = a * 100;
      draft._b = b * 100;
    });
  }

  compute(converter: Colorjs): ColorOklabch {
    const [lightness, a, b] = converter.oklab;

    return this.adjustOklab(lightness * 100, a * 100, b * 100);
  }

  converter(): Colorjs {
    return new Colorjs("oklab", [this._lightness / 100, this._a / 100, this._b / 100]);
  }

  static colorspaceInfo(variant?: string): ColorspaceInfo {
    switch (variant) {
      case "oklab":
        return {
          colorspace: "oklabch",
          channels: [
            { channel: "lightnessLab", label: "L", range: [0, 100], step: 2 },
            { channel: "a", label: "A", range: [-40, 40], step: 2 },
            { channel: "b", label: "B", range: [-40, 40], step: 2 },
          ],
        };
      case "oklch":
        return {
          colorspace: "oklabch",
          channels: [
            { channel: "lightnessLch", label: "L", range: [0, 100], step: 2 },
            { channel: "chroma", label: "C", range: [0, 40], step: 1 },
            { channel: "hue", label: "H", range: [0, 360], step: 5 },
          ],
        };
      default:
        throw new Error("Bad variant");
    }
  }
}
