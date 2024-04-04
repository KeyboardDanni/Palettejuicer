import chroma from "chroma-js";

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
  HueL,
  SaturationL,
  Lightness,
  HueV,
  SaturationV,
  Value
}

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

  get colorspace() { return this._colorspace; }
  get red() { return this._red; }
  get green() { return this._green; }
  get blue() { return this._blue; }
  get hue() { return this._hue; }
  get saturationL() { return this._saturationL; }
  get lightness() { return this._lightness; }
  get saturationV() { return this._saturationV; }
  get value() { return this._value; }

  static fromRgb(red: number, green: number, blue: number): Color {
    const color = new Color();

    return color.rgb(red, green, blue);
  }

  static fromHsl(hue: number, saturation: number, lightness: number): Color {
    const color = new Color();

    return color.hsl(hue, saturation, lightness);
  }

  static fromHsv(hue: number, saturation: number, value: number): Color {
    const color = new Color();

    return color.hsv(hue, saturation, value);
  }

  clone(): Color {
    const color = new Color();

    color._colorspace = this._colorspace;
    color._red = this._red;
    color._green = this._green;
    color._blue = this._blue;
    color._hue = this._hue;
    color._saturationL = this._saturationL;
    color._lightness = this._lightness;
    color._saturationV = this._saturationV;
    color._value = this._value;

    return color;
  }

  rgb(red: number, green: number, blue: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.RGB;
    color._red = red;
    color._green = green;
    color._blue = blue;

    const input = chroma.rgb(red, green, blue);

    const [hue, saturationL, lightness] = input.hsl();
    const [, saturationV, value] = input.hsv();
    
    if (!Number.isNaN(hue)) {
      color._hue = hue;
      color._saturationL = saturationL;
    }
    color._lightness = lightness;
    color._saturationV = saturationV;
    color._value = value;

    color.normalize();
    
    return color;
  }

  hsl(hue: number, saturation: number, lightness: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.HSL;
    color._hue = hue;
    color._saturationL = saturation;
    color._lightness = lightness;

    const input = chroma.hsl(hue, saturation, lightness);

    [color._red, color._green, color._blue] = input.rgb(false);
    [, color._saturationV, color._value] = input.hsv();

    color.normalize();
    
    return color;
  }

  hsv(hue: number, saturation: number, value: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.HSV;
    color._hue = hue;
    color._saturationV = saturation;
    color._value = value;

    const input = chroma.hsv(hue, saturation, value);

    [color._red, color._green, color._blue] = input.rgb(false);
    [, color._saturationL, color._lightness] = input.hsl();

    color.normalize();
    
    return color;
  }

  adjustRgb(red: number | null, green: number | null, blue: number | null): Color {
    return this.rgb(red ?? this.red, green ?? this.green, blue ?? this.blue);
  }
  adjustHsl(hue: number | null, saturation: number | null, lightness: number | null): Color {
    return this.hsl(hue ?? this.hue, saturation ?? this.saturationL, lightness ?? this.lightness);
  }
  adjustHsv(hue: number | null, saturation: number | null, value: number | null): Color {
    return this.hsv(hue ?? this.hue, saturation ?? this.saturationV, value ?? this.value);
  }

  adjust(channel: Channel, value: number): Color {
    switch (channel) {
      case Channel.Red:
        return this.adjustRgb(value, null, null);
      case Channel.Green:
        return this.adjustRgb(null, value, null);
      case Channel.Blue:
        return this.adjustRgb(null, null, value);
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
        return this.adjustRgb(null, 0, 0);
      case Channel.Green:
        return this.adjustRgb(0, null, 0);
      case Channel.Blue:
        return this.adjustRgb(0, 0, null);
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

  private normalize() {
    this._red = clamp(this._red, 0, 255);
    this._green = clamp(this._green, 0, 255);
    this._blue = clamp(this._blue, 0, 255);
    this._hue = clamp(this._hue, 0, 360);
    this._saturationL = clamp(this._saturationL, 0, 1.0);
    this._lightness = clamp(this._lightness, 0, 1.0);
    this._saturationV = clamp(this._saturationV, 0, 1.0);
    this._value = clamp(this._value, 0, 1.0);
  }
}

export default Color;
