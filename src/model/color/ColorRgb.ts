import Colorjs from "colorjs.io";

import { Colorspace } from "./Color";
import { clamp } from "../../util/math";

export class ColorRgb implements Colorspace {
  private _red: number;
  private _green: number;
  private _blue: number;

  get red() { return this._red * 255; }
  get green() { return this._green * 255; }
  get blue() { return this._blue * 255; }
  get redRaw() { return this._red; }
  get greenRaw() { return this._green; }
  get blueRaw() { return this._blue; }

  private constructor(red: number, green: number, blue: number) {
    this._red = red;
    this._green = green;
    this._blue = blue;
  }

  static from(red: number, green: number, blue: number): ColorRgb {
    return new ColorRgb(red / 255, green / 255, blue / 255);
  }

  static fromRaw(red: number, green: number, blue: number): ColorRgb {
    return new ColorRgb(red, green, blue);
  }

  clone(): ColorRgb {
    return new ColorRgb(this._red, this._green, this._blue);
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
    return new ColorRgb(red ?? this._red, green ?? this._green, blue ?? this._blue);
  }

  compute(converter: Colorjs): ColorRgb {
    const [red, green, blue] = converter.srgb;

    return new ColorRgb(red, green, blue);
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
