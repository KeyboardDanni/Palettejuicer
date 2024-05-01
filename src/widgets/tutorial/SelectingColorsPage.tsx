import { useState } from "react";

import { range, steps } from "../../util/math";
import { ColorSelector } from "../common/ColorSelector";
import { Color, GamutMapAlgorithm } from "../../model/color/Color";
import { PaletteCel } from "../PaletteView";
import { ColorspaceRgb } from "../../model/color/ColorspaceRgb";
import { ColorspaceHsl } from "../../model/color/ColorspaceHsl";
import { ColorspaceLch } from "../../model/color/ColorspaceLch";
import { ColorspaceOklch } from "../../model/color/ColorspaceOklch";

const COLOR_HSL_HUES = range(0, 360, 30).map((hue) => {
  return new Color(new ColorspaceHsl([hue, 90, 50]));
});

const COLOR_LCH_HUES = range(0, 360, 30).map((hue) => {
  const color = new Color(new ColorspaceLch([60, 70, hue]));

  return color.toSrgbGamut(GamutMapAlgorithm.Css) ?? color;
});

const COLOR_OKLCH_HUES = range(0, 360, 30).map((hue) => {
  const color = new Color(ColorspaceOklch.fromTransformed([68, 20, hue]));

  return color.toSrgbGamut(GamutMapAlgorithm.Css) ?? color;
});

const BLUES_LCH_L_STEPS = steps(29.56830197909668, 100, 10);
const BLUES_LCH_C_STEPS = steps(131.2014480889621, 0, 10);
const BLUES_OKLCH_L_STEPS = steps(45.201371817442364, 100, 10);
const BLUES_OKLCH_C_STEPS = steps(31.321438863448492, 0, 10);

const COLOR_LCH_BLUES = range(0, 10, 1).map((i) => {
  const color = new Color(new ColorspaceLch([BLUES_LCH_L_STEPS[i], BLUES_LCH_C_STEPS[i], 301.3642677330783]));

  return color.toSrgbGamut(GamutMapAlgorithm.Css) ?? color;
});

const COLOR_OKLCH_BLUES = range(0, 10, 1).map((i) => {
  const color = new Color(
    ColorspaceOklch.fromTransformed([BLUES_OKLCH_L_STEPS[i], BLUES_OKLCH_C_STEPS[i], 264.0520226163699])
  );

  return color.toSrgbGamut(GamutMapAlgorithm.Css) ?? color;
});

export function SelectingColorsPage() {
  const [color, setColor] = useState(new Color(ColorspaceRgb.fromTransformed([192, 64, 128])));

  const hslColors = COLOR_HSL_HUES.map((color) => <PaletteCel key={color.hex} color={color} />);
  const lchColors = COLOR_LCH_HUES.map((color) => <PaletteCel key={color.hex} color={color} />);
  const oklchColors = COLOR_OKLCH_HUES.map((color) => <PaletteCel key={color.hex} color={color} />);
  const lchBlues = COLOR_LCH_BLUES.map((color) => <PaletteCel key={color.hex} color={color} />);
  const oklchBlues = COLOR_OKLCH_BLUES.map((color) => <PaletteCel key={color.hex} color={color} />);

  return (
    <>
      <div className="tutorial-page">
        <p>
          The first step is finding a few starting colors. You begin with a blank <b>Palette</b>, shown on the right
          hand side of the screen. Simply click on any cel within this palette to select it.
        </p>
        <p>
          In the top left, you will see the <b>Color Selector</b>. This lets you adjust the color however you see fit:
        </p>
        <ColorSelector color={color} computed={false} onColorChange={setColor} />
        <p>
          There's a lot of sliders and tabs, so let's go over them. First, you have the <b>R</b>, <b>G</b>, <b>B</b>{" "}
          sliders which simply control the <b>red</b>, <b>green</b>, and <b>blue</b> components that make up the color.
          Of course, picking colors with these sliders directly isn't very intuitive. That's where the other colorspaces
          come in, each represented by a different tab.
        </p>
        <h2>HSL/HSV</h2>
        <p>
          The HSL and HSV colorspaces reshape the RGB space to be easier to adjust. The <b>H</b> and <b>S</b> components
          are <b>hue</b> and <b>saturation</b>: <b>hue</b> is simply a pigment (like red, orange, purple, etc.) without
          any shading, while <b>saturation</b> describes how "vivid" the color is. A <b>saturation</b> of 0 makes the
          color grayscale.
        </p>
        <p>
          The <b>L</b> and <b>V</b> components of HSL and HSV refer to <b>lightness</b> and <b>value</b>. These work a
          bit differently from each other. In HSL, <b>lightness</b> moves the color from black to white. In HSV,{" "}
          <b>value</b> goes from black to the saturated color, meaning that to get white, you need to set the{" "}
          <b>saturation</b> to 0.
        </p>
        <p>
          Both HSL and HSV are useful for selecting colors, but they have one big problem: they don't model how our eyes
          "perceive" color. Take a look at these hues below:
        </p>
        <div className="color-container">
          <div className="palette-row">{hslColors}</div>
        </div>
        <p>
          The yellow, cyan, and pink colors look much brighter than the deep blue, yet HSL/HSV considers all of these to
          be the same brightness! Clearly if we want consistent shading, we need a better color model.
        </p>
        <h2>LAB/LCH</h2>
        <p>
          The LAB colorspace was created by the{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://en.wikipedia.org/wiki/International_Commission_on_Illumination"
          >
            International Commission on Illumination
          </a>{" "}
          as a way to describe colors based on how light they appear to be. The <b>L</b> component refers to{" "}
          <b>perceptual lightness</b>.
        </p>
        <p>
          The <b>A</b> and <b>B</b> components are a bit less straightforward. A positive <b>A</b> makes the color more
          red, while a negative <b>A</b> is more green. A positive <b>B</b> is more blue, while a negative <b>B</b> is
          more yellow.
        </p>
        <p>
          In some ways, LAB is even more awkward to use than RGB because of how <b>A</b> and <b>B</b> work. Fortunately,
          LCH is easier to understand. Similar to HSL/HSV, the LCH space has <b>lightness</b> and <b>hue</b>. The{" "}
          <b>C</b> stands for <b>chroma</b>, which is similar to, but not exactly like, saturation. With LCH, we can see
          that lightness is much more even across hues:
        </p>
        <div className="color-container">
          <div className="palette-row">{lchColors}</div>
        </div>
        <h2>OkLAB/OkLCH</h2>
        <p>
          OkLAB and OkLCH were created by{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://bottosson.github.io/posts/oklab/">
            Björn Ottosson
          </a>{" "}
          to address some of the shortcomings of the LAB/LCH spaces. It works similarly to those spaces, but often
          produces better results:
        </p>
        <div className="color-container">
          <div className="palette-row">{oklchColors}</div>
        </div>
        <p>In particular, it fixes an issue with fading from blue to white. With LCH, this happens:</p>
        <div className="color-container">
          <div className="palette-row">{lchBlues}</div>
        </div>
        <p>With OkLCH, the colors stay blue instead of turning purple:</p>
        <div className="color-container">
          <div className="palette-row">{oklchBlues}</div>
        </div>
        <h2>Hexadecimal code</h2>
        <p>
          Of course, you can also get and set the color using classic HTML color codes. These are a compact way to
          express an RGB color. While less useful nowadays, you can still use this to transfer the color between
          programs that only support RGB.
        </p>
      </div>
    </>
  );
}
