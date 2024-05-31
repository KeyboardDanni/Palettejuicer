import fs from "fs";
import {
  to as colorjsTo,
  ColorSpace as ColorjsSpace,
  sRGB,
  HSL,
  HSV,
  Lab,
  LCH,
  OKLab,
  OKLCH,
  Okhsl,
  Okhsv,
} from "colorjs.io/fn";

ColorjsSpace.register(sRGB);
ColorjsSpace.register(HSL);
ColorjsSpace.register(HSV);
ColorjsSpace.register(Lab);
ColorjsSpace.register(LCH);
ColorjsSpace.register(OKLab);
ColorjsSpace.register(OKLCH);
ColorjsSpace.register(Okhsl);
ColorjsSpace.register(Okhsv);

const testColors = [
  // grayscale
  {
    red: 0, green: 0, blue: 0, // black
    hex: "#000000"
  },
  {
    red: 255, green: 255, blue: 255, // white
    hex: "#ffffff"
  },
  {
    red: 127, green: 127, blue: 127, // gray
    hex: "#7f7f7f"
  },
  {
    red: 64, green: 64, blue: 64, // dark gray
    hex: "#404040"
  },
  {
    red: 191, green: 191, blue: 191, // light gray
    hex: "#bfbfbf"
  },

  // saturated colors
  {
    red: 255, green: 0, blue: 0, // red
    hex: "#ff0000"
  },
  {
    red: 255, green: 127, blue: 0, // orange
    hex: "#ff7f00"
  },
  {
    red: 255, green: 255, blue: 0, // yellow
    hex: "#ffff00"
  },
  {
    red: 191, green: 255, blue: 0, // lime
    hex: "#bfff00"
  },
  {
    red: 0, green: 255, blue: 0, // green
    hex: "#00ff00"
  },
  {
    red: 0, green: 255, blue: 160, // sea green
    hex: "#00ffa0"
  },
  {
    red: 0, green: 255, blue: 255, // cyan
    hex: "#00ffff"
  },
  {
    red: 0, green: 180, blue: 255, // cool blue
    hex: "#00b4ff"
  },
  {
    red: 0, green: 0, blue: 255, // blue
    hex: "#0000ff"
  },
  {
    red: 127, green: 0, blue: 255, // purple
    hex: "#7f00ff"
  },
  {
    red: 255, green: 0, blue: 255, // magenta
    hex: "#ff00ff"
  },
  {
    red: 255, green: 0, blue: 160, // hot pink
    hex: "#ff00a0"
  },

  // dark colors
  {
    red: 127, green: 0, blue: 0, // red
    hex: "#7f0000"
  },
  {
    red: 127, green: 64, blue: 0, // orange
    hex: "#7f4000"
  },
  {
    red: 127, green: 127, blue: 0, // yellow
    hex: "#7f7f00"
  },
  {
    red: 96, green: 127, blue: 0, // lime
    hex: "#607f00"
  },
  {
    red: 0, green: 127, blue: 0, // green
    hex: "#007f00"
  },
  {
    red: 0, green: 127, blue: 80, // sea green
    hex: "#007f50"
  },
  {
    red: 0, green: 127, blue: 127, // cyan
    hex: "#007f7f"
  },
  {
    red: 0, green: 90, blue: 127, // cool blue
    hex: "#005a7f"
  },
  {
    red: 0, green: 0, blue: 127, // blue
    hex: "#00007f"
  },
  {
    red: 64, green: 0, blue: 127, // purple
    hex: "#40007f"
  },
  {
    red: 127, green: 0, blue: 127, // magenta
    hex: "#7f007f"
  },
  {
    red: 127, green: 0, blue: 80, // hot pink
    hex: "#7f0050"
  },

  // desaturated colors
  {
    red: 191, green: 64, blue: 64, // red
    hex: "#bf4040"
  },
  {
    red: 191, green: 127, blue: 64, // orange
    hex: "#bf7f40"
  },
  {
    red: 191, green: 191, blue: 64, // yellow
    hex: "#bfbf40"
  },
  {
    red: 160, green: 191, blue: 64, // lime
    hex: "#a0bf40"
  },
  {
    red: 64, green: 191, blue: 64, // green
    hex: "#40bf40"
  },
  {
    red: 64, green: 191, blue: 144, // sea green
    hex: "#40bf90"
  },
  {
    red: 64, green: 191, blue: 191, // cyan
    hex: "#40bfbf"
  },
  {
    red: 64, green: 154, blue: 191, // cool blue
    hex: "#409abf"
  },
  {
    red: 64, green: 64, blue: 191, // blue
    hex: "#4040bf"
  },
  {
    red: 127, green: 64, blue: 191, // purple
    hex: "#7f40bf"
  },
  {
    red: 191, green: 64, blue: 191, // magenta
    hex: "#bf40bf"
  },
  {
    red: 191, green: 64, blue: 144, // hot pink
    hex: "#bf4090"
  },

  // pastel colors
  {
    red: 245, green: 163, blue: 163, // red
    hex: "#f5a3a3"
  },
  {
    red: 245, green: 204, blue: 163, // orange
    hex: "#f5cca3"
  },
  {
    red: 245, green: 245, blue: 163, // yellow
    hex: "#f5f5a3"
  },
  {
    red: 224, green: 245, blue: 163, // lime
    hex: "#e0f5a3"
  },
  {
    red: 163, green: 245, blue: 163, // green
    hex: "#a3f5a3"
  },
  {
    red: 163, green: 245, blue: 214, // sea green
    hex: "#a3f5d6"
  },
  {
    red: 163, green: 245, blue: 245, // cyan
    hex: "#a3f5f5"
  },
  {
    red: 163, green: 221, blue: 245, // cool blue
    hex: "#a3ddf5"
  },
  {
    red: 163, green: 163, blue: 245, // blue
    hex: "#a3a3f5"
  },
  {
    red: 204, green: 163, blue: 245, // purple
    hex: "#cca3f5"
  },
  {
    red: 245, green: 163, blue: 245, // magenta
    hex: "#f5a3f5"
  },
  {
    red: 245, green: 163, blue: 214, // hot pink
    hex: "#f5a3d6"
  },
];

let newColors = testColors.map((color) => {
    const newColor = {};
    const converter = {space: "srgb", coords: [color.red / 255, color.green / 255, color.blue / 255]};

    newColor.red = color.red;
    newColor.green = color.green;
    newColor.blue = color.blue;

    const [hue, saturationL, lightness] = colorjsTo(converter, "hsl").coords;
    const [, saturationV, value] = colorjsTo(converter, "hsv").coords;

    newColor.hue = hue ?? 0;
    newColor.saturationL = saturationL;
    newColor.lightness = lightness;
    newColor.saturationV = saturationV;
    newColor.value = value;

    const [labLightness, labA, labB] = colorjsTo(converter, "lab").coords;
    const [, lchChroma, lchHue] = colorjsTo(converter, "lch").coords;

    newColor.labLightness = labLightness;
    newColor.labA = labA;
    newColor.labB = labB;
    newColor.lchChroma = lchChroma;
    newColor.lchHue = lchHue ?? 0;

    const [oklabLightness, oklabA, oklabB] = colorjsTo(converter, "oklab").coords;
    const [, oklchChroma, oklchHue] = colorjsTo(converter, "oklch").coords;
    
    newColor.oklabLightness = oklabLightness * 100;
    newColor.oklabA = oklabA * 100;
    newColor.oklabB = oklabB * 100;
    newColor.oklchChroma = oklchChroma * 100;
    newColor.oklchHue = oklchHue ?? 0;

    const [okhslHue, okhslSaturation, okhslLightness] = colorjsTo(converter, "okhsl").coords;
    const [, okhsvSaturation, okhsvValue] = colorjsTo(converter, "okhsv").coords;
    
    newColor.okhslHue = okhslHue ?? 0;
    newColor.okhslSaturation = okhslSaturation * 100;
    newColor.okhslLightness = okhslLightness * 100;
    newColor.okhsvSaturation = okhsvSaturation * 100;
    newColor.okhsvValue = okhsvValue * 100;

    newColor.hex = color.hex;
    
    return newColor;
});

fs.writeFileSync("out.json", JSON.stringify(newColors, null, 2), "utf-8");
