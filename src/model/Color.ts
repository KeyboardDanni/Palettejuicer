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

  get colorspace() { return this._colorspace; }
  get red() { return this._red; }
  get green() { return this._green; }
  get blue() { return this._blue; }
  get hue() { return this._hue; }
  get saturationL() { return this._saturationL; }
  get lightness() { return this._lightness; }
  get saturationV() { return this._saturationV; }
  get value() { return this._value; }
  get hex() {
    const rgb = chroma.rgb(this._red, this._green, this._blue);

    return rgb.hex();
  }

  static fromRgb(red: number, green: number, blue: number): Color {
    const color = new Color();

    return color.withRgb(red, green, blue);
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
    let red, green, blue;

    try {
      [red, green, blue] = chroma.hex(hex).rgb();
    } catch (error) {
      return null;
    }

    return Color.fromRgb(red, green, blue);
  }

  clone(): Color {
    const color = new Color();

    for (const name of clonedProperties) {
      // @ts-ignore
      color[name] = this[name];
    }

    return color;
  }

  private _computeRgb(input: chroma.Color) {
    [this._red, this._green, this._blue] = input.rgb(false);
  }

  private _computeHsl(input: chroma.Color, setHue: boolean) {
    const [hue, saturationL, lightness] = input.hsl();
    if (setHue && !Number.isNaN(hue)) {
      this._hue = hue;
    }
    this._saturationL = saturationL;
    this._lightness = lightness;
  }

  private _computeHsv(input: chroma.Color) {
    const [, saturationV, value] = input.hsv();
    // Hue is either already set by HSL, or we are convering from HSV anyway,
    //  so don't bother with it here.
    this._saturationV = saturationV;
    this._value = value;
  }

  withRgb(red: number, green: number, blue: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.RGB;
    color._red = red;
    color._green = green;
    color._blue = blue;

    const input = chroma.rgb(red, green, blue);

    color._computeHsl(input, true);
    color._computeHsv(input);
    
    return color;
  }

  withHsl(hue: number, saturation: number, lightness: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.HSL;
    color._hue = hue;
    color._saturationL = saturation;
    color._lightness = lightness;

    const input = chroma.hsl(hue, saturation, lightness);

    color._computeRgb(input);
    color._computeHsv(input);
    
    return color;
  }

  withHsv(hue: number, saturation: number, value: number): Color {
    const color = this.clone();

    color._colorspace = Colorspace.HSV;
    color._hue = hue;
    color._saturationV = saturation;
    color._value = value;

    const input = chroma.hsv(hue, saturation, value);

    color._computeRgb(input);
    color._computeHsl(input, false);
    
    return color;
  }

  adjustRgb(red: number | null, green: number | null, blue: number | null): Color {
    return this.withRgb(red ?? this.red, green ?? this.green, blue ?? this.blue);
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
}

export default Color;
