import { immerable, produce } from "immer";
import { Expose } from "class-transformer";
import Colorjs from "colorjs.io";

import { Colorspace, ColorspaceInfo } from "./Colorspace";

export class ColorLabch extends Colorspace {
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

  static fromLab(lightness: number, a: number, b: number): ColorLabch {
    const color = new ColorLabch();

    return color.adjustLab(lightness, a, b);
  }

  static fromLch(lightness: number, chroma: number, hue: number): ColorLabch {
    const color = new ColorLabch();

    return color.adjustLch(lightness, chroma, hue);
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
    return produce(this, (draft: this) => {
      draft._lightness = lightness ?? this._lightness;
      draft._a = a ?? this._a;
      draft._b = b ?? this._b;

      const converter = new Colorjs("lab", [draft._lightness, draft._a, draft._b]);
      const [, chroma, hue] = converter.lch;
      draft._chroma = chroma;
      draft._hue = !Number.isNaN(hue) ? hue : this._hue;
    });
  }

  adjustLch(lightness: number | null, chroma: number | null, hue: number | null): ColorLabch {
    return produce(this, (draft: this) => {
      draft._lightness = lightness ?? this._lightness;
      draft._chroma = chroma ?? this._chroma;
      draft._hue = hue !== null && !Number.isNaN(hue) ? hue : this._hue;

      const converter = new Colorjs("lch", [draft._lightness, draft._chroma, draft._hue]);
      [, draft._a, draft._b] = converter.lab;
    });
  }

  compute(converter: Colorjs): ColorLabch {
    const [lightness, a, b] = converter.lab;

    return this.adjustLab(lightness, a, b);
  }

  converter(): Colorjs {
    return new Colorjs("lab", [this._lightness, this._a, this._b]);
  }

  static colorspaceInfo(variant?: string): ColorspaceInfo {
    switch (variant) {
      case "lab":
        return {
          colorspace: "labch",
          channels: [
            { channel: "lightnessLab", label: "L", range: [0, 100], step: 2 },
            { channel: "a", label: "A", range: [-125, 125], step: 5 },
            { channel: "b", label: "B", range: [-125, 125], step: 5 },
          ],
        };
      case "lch":
        return {
          colorspace: "labch",
          channels: [
            { channel: "lightnessLch", label: "L", range: [0, 100], step: 2 },
            { channel: "chroma", label: "C", range: [0, 150], step: 5 },
            { channel: "hue", label: "H", range: [0, 360], step: 5 },
          ],
        };
      default:
        throw new Error("Bad variant");
    }
  }
}
