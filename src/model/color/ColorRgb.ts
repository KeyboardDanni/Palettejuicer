import { immerable, produce } from "immer";
import Colorjs from "colorjs.io";
import hexRgb from "hex-rgb";
import rgbHex from "rgb-hex";

import { Colorspace } from "./Color";
import { clamp } from "../../util/math";

export class ColorRgb implements Colorspace {
  [immerable] = true;

  private _red: number = 0;
  private _green: number = 0;
  private _blue: number = 0;
  private _hex: string = "#000000";

  get red() { return this._red * 255; } // prettier-ignore
  get green() { return this._green * 255; } // prettier-ignore
  get blue() { return this._blue * 255; } // prettier-ignore
  get redRaw() { return this._red; } // prettier-ignore
  get greenRaw() { return this._green; } // prettier-ignore
  get blueRaw() { return this._blue; } // prettier-ignore
  get hex() { return this._hex; } // prettier-ignore

  static from(red: number, green: number, blue: number): ColorRgb {
    return ColorRgb.fromRaw(red / 255, green / 255, blue / 255);
  }

  static fromRaw(red: number, green: number, blue: number): ColorRgb {
    const color = new ColorRgb();

    return color.adjustRaw(red, green, blue);
  }

  static fromHex(hex: string) {
    let rgb;

    try {
      rgb = hexRgb(hex);
    } catch (error) {
      return null;
    }

    return ColorRgb.fromRaw(rgb.red / 255, rgb.green / 255, rgb.blue / 255);
  }

  channel(name: string): number {
    switch (name) {
      case "red":
        return this.red;
      case "green":
        return this.green;
      case "blue":
        return this.blue;
      case "redRaw":
        return this.redRaw;
      case "greenRaw":
        return this.greenRaw;
      case "blueRaw":
        return this.blueRaw;
      default:
        throw new Error("Bad channel");
    }
  }

  adjustChannel(channel: string, value: number): ColorRgb {
    switch (channel) {
      case "red":
        return this.adjustRgb(value, null, null);
      case "green":
        return this.adjustRgb(null, value, null);
      case "blue":
        return this.adjustRgb(null, null, value);
      case "redRaw":
        return this.adjustRaw(value, null, null);
      case "greenRaw":
        return this.adjustRaw(null, value, null);
      case "blueRaw":
        return this.adjustRaw(null, null, value);
      default:
        throw new Error("Bad channel");
    }
  }

  adjustRgb(red: number | null, green: number | null, blue: number | null): ColorRgb {
    if (red) red /= 255;
    if (green) green /= 255;
    if (blue) blue /= 255;

    return this.adjustRaw(red, green, blue);
  }

  adjustRaw(red: number | null, green: number | null, blue: number | null): ColorRgb {
    return produce(this, (draft: this) => {
      if (red !== null) draft._red = red;
      if (green !== null) draft._green = green;
      if (blue !== null) draft._blue = blue;

      const [redNormal, greenNormal, blueNormal] = draft.intNormalized();

      draft._hex = "#" + rgbHex(redNormal, greenNormal, blueNormal);
    });
  }

  compute(converter: Colorjs): ColorRgb {
    const [red, green, blue] = converter.srgb;

    return ColorRgb.fromRaw(red, green, blue);
  }

  converter(): Colorjs {
    return new Colorjs("srgb", [this._red, this._green, this._blue]);
  }

  intNormalized() {
    const red = clamp(Math.round(this.red), 0, 255);
    const green = clamp(Math.round(this.green), 0, 255);
    const blue = clamp(Math.round(this.blue), 0, 255);

    return [red, green, blue];
  }
}
