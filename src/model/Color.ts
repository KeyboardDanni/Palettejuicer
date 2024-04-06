import Colorjs from "colorjs.io";
import hexRgb from "hex-rgb";
import rgbHex from "rgb-hex";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export enum Colorspace {
  RGB,
  HSL,
  HSV
}

export enum Channel {
  Red,
  Green,
  Blue,
  RedRaw,
  GreenRaw,
  BlueRaw,
  HueL,
  SaturationL,
  Lightness,
  HueV,
  SaturationV,
  Value
}

const clonedProperties = [
  "_colorspace",
  "_red",
  "_green",
  "_blue",
  "_hue",
  "_saturationL",
  "_lightness",
  "_saturationV",
  "_value",
  "_hex"
];

class Color {
  private _colorspace: Colorspace = Colorspace.RGB;
  private _red: number = 0;
  private _green: number = 0;
  private _blue: number = 0;
  private _hue: number = 0;
  private _saturationL: number = 0;
  private _lightness: number = 0;
  private _saturationV: number = 0;
  private _value: number = 0;
  private _hex: string = "#000000";

  get colorspace() { return this._colorspace; }
  get red() { return this._red * 255; }
  get green() { return this._green * 255; }
  get blue() { return this._blue * 255; }
  get redRaw() { return this._red; }
  get greenRaw() { return this._green; }
  get blueRaw() { return this._blue; }
  get hue() { return this._hue; }
  get saturationL() { return this._saturationL; }
  get lightness() { return this._lightness; }
  get saturationV() { return this._saturationV; }
  get value() { return this._value; }
  get hex() { return this._hex; }

  static fromRgb(red: number, green: number, blue: number, raw: boolean = false): Color {
    const color = new Color();

    return color.withRgb(red, green, blue, raw);
  }

  static fromHsl(hue: number, saturation: number, lightness: number): Color {
    const color = new Color();

    return color.withHsl(hue, saturation, lightness);
  }

  static fromHsv(hue: number, saturation: number, value: number): Color {
    const color = new Color();

    return color.withHsv(hue, saturation, value);
  }

  static fromHex(hex: string): Color | null {
    let rgb;

    try {
      rgb = hexRgb(hex);
    } catch (error) {
      return null;
    }

    return Color.fromRgb(rgb.red, rgb.green, rgb.blue, false);
  }

  clone(): Color {
    const color = new Color();

    for (const name of clonedProperties) {
      // @ts-expect-error tsc complains about incompatible properties that aren't being used if we try to type this
      color[name] = this[name];
    }

    return color;
  }

  private _computeRgb(input: Colorjs) {
    [this._red, this._green, this._blue] = input.srgb;
  }

  private _computeHsl(input: Colorjs, setHue: boolean) {
    const [hue, saturationL, lightness] = input.hsl;
    if (setHue && !Number.isNaN(hue)) {
      this._hue = hue;
    }
    this._saturationL = saturationL;
    this._lightness = lightness;
  }

  private _computeHsv(input: Colorjs) {
    const [, saturationV, value] = input.hsv;
    // Hue is either already set by HSL, or we are convering from HSV anyway,
    //  so don't bother with it here.
    this._saturationV = saturationV;
    this._value = value;
  }

  private _computeHex() {
    const [red, green, blue] = this.rgbIntNormalized();
    this._hex = "#" + rgbHex(red, green, blue);
  }

  withRgb(red: number, green: number, blue: number, raw: boolean = false): Color {
    const color = this.clone();

    if (!raw) {
      red /= 255;
      green /= 255;
      blue /= 255;
    }

    color._colorspace = Colorspace.RGB;
    color._red = red;
    color._green = green;
    color._blue = blue;

    const input = new Colorjs("srgb", [red, green, blue]);

    color._computeHsl(input, true);
    color._computeHsv(input);
    color._computeHex();
    
    return color;
  }

  withHsl(hue: number, saturation: number, lightness: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.HSL;
    color._hue = hue;
    color._saturationL = saturation;
    color._lightness = lightness;

    const input = new Colorjs("hsl", [hue, saturation, lightness]);

    color._computeRgb(input);
    color._computeHsv(input);
    color._computeHex();
    
    return color;
  }

  withHsv(hue: number, saturation: number, value: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.HSV;
    color._hue = hue;
    color._saturationV = saturation;
    color._value = value;

    const input = new Colorjs("hsv", [hue, saturation, value]);

    color._computeRgb(input);
    color._computeHsl(input, false);
    color._computeHex();
    
    return color;
  }

  adjustRgb(red: number | null, green: number | null, blue: number | null, raw: boolean = false): Color {
    if (!raw) {
      if (red) red /= 255;
      if (green) green /= 255;
      if (blue) blue /= 255;
    }

    return this.withRgb(red ?? this.redRaw, green ?? this.greenRaw, blue ?? this.blueRaw, true);
  }
  adjustHsl(hue: number | null, saturation: number | null, lightness: number | null): Color {
    return this.withHsl(hue ?? this.hue, saturation ?? this.saturationL, lightness ?? this.lightness);
  }
  adjustHsv(hue: number | null, saturation: number | null, value: number | null): Color {
    return this.withHsv(hue ?? this.hue, saturation ?? this.saturationV, value ?? this.value);
  }

  adjust(channel: Channel, value: number): Color {
    switch (channel) {
      case Channel.Red:
        return this.adjustRgb(value, null, null, false);
      case Channel.Green:
        return this.adjustRgb(null, value, null, false);
      case Channel.Blue:
        return this.adjustRgb(null, null, value, false);
      case Channel.RedRaw:
        return this.adjustRgb(value, null, null, true);
      case Channel.GreenRaw:
        return this.adjustRgb(null, value, null, true);
      case Channel.BlueRaw:
        return this.adjustRgb(null, null, value, true);
      case Channel.HueL:
        return this.adjustHsl(value, null, null);
      case Channel.SaturationL:
        return this.adjustHsl(null, value, null);
      case Channel.Lightness:
        return this.adjustHsl(null, null, value);
      case Channel.HueV:
        return this.adjustHsv(value, null, null);
      case Channel.SaturationV:
        return this.adjustHsv(null, value, null);
      case Channel.Value:
        return this.adjustHsv(null, null, value);
      default:
        throw new Error("Bad enum");
    }
  }

  channel(channel: Channel): number {
    switch (channel) {
      case Channel.Red:
        return this.red;
      case Channel.Green:
        return this.green;
      case Channel.Blue:
        return this.blue;
      case Channel.RedRaw:
        return this.redRaw;
      case Channel.GreenRaw:
        return this.greenRaw;
      case Channel.BlueRaw:
        return this.blueRaw;
      case Channel.HueL:
        return this.hue;
      case Channel.SaturationL:
        return this.saturationL;
      case Channel.Lightness:
        return this.lightness;
      case Channel.HueV:
        return this.hue;
      case Channel.SaturationV:
        return this.saturationV;
      case Channel.Value:
        return this.value;
      default:
        throw new Error("Bad enum");
    }
  }

  solo(channel: Channel) {
    switch (channel) {
      case Channel.Red:
        return this.adjustRgb(null, 0, 0, false);
      case Channel.Green:
        return this.adjustRgb(0, null, 0, false);
      case Channel.Blue:
        return this.adjustRgb(0, 0, null, false);
      case Channel.RedRaw:
        return this.adjustRgb(null, 0, 0, true);
      case Channel.GreenRaw:
        return this.adjustRgb(0, null, 0, true);
      case Channel.BlueRaw:
        return this.adjustRgb(0, 0, null, true);
      case Channel.HueL:
        return this.adjustHsl(null, 1.0, 0.5);
      case Channel.SaturationL:
        return this.adjustHsl(0.0, null, 0.5);
      case Channel.Lightness:
        return this.adjustHsl(0.0, 0.0, null);
      case Channel.HueV:
        return this.adjustHsv(null, 1.0, 0.5);
      case Channel.SaturationV:
        return this.adjustHsv(0.0, null, 1.0);
      case Channel.Value:
        return this.adjustHsv(0.0, 0.0, null);
      default:
        throw new Error("Bad enum");
    }
  }

  rgbIntNormalized() {
    const red = clamp(Math.round(this.red), 0, 255);
    const green = clamp(Math.round(this.green), 0, 255);
    const blue = clamp(Math.round(this.blue), 0, 255);

    return [red, green, blue];
  }
}

export default Color;
