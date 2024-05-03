import { steps } from "../../util/math";
import { Color, GamutMapAlgorithm } from "../../model/color/Color";
import { ColorspaceOklch } from "../../model/color/ColorspaceOklch";
import { PaletteCel } from "../PaletteView";
import { ColorSelector } from "../common/ColorSelector";

const REALLY_OUT_OF_GAMUT_COLOR = new Color(ColorspaceOklch.fromTransformed([76, 36, 285]));
const OUT_OF_GAMUT_COLOR = new Color(ColorspaceOklch.fromTransformed([70, 22, 285]));
const CLIPPED_GAMUT_COLOR = new Color(
  ColorspaceOklch.fromTransformed([65.87003264098756, 21.882078856636657, 301.44430921478846])
);
const IN_GAMUT_COLOR = new Color(ColorspaceOklch.fromTransformed([70, 16, 285]));

const OUT_OF_GAMUT_SHADES = steps(15, 95, 8).map((i) => {
  return new Color(ColorspaceOklch.fromTransformed([i, 12, 235]));
});

const IN_GAMUT_SHADES = OUT_OF_GAMUT_SHADES.map((color) => {
  return color.toSrgbGamut(GamutMapAlgorithm.Css) ?? color;
});

export function OutOfGamutPage() {
  const outOfGamutShades = OUT_OF_GAMUT_SHADES.map((color) => <PaletteCel key={color.hex} color={color} />);
  const inGamutShades = IN_GAMUT_SHADES.map((color) => <PaletteCel key={color.hex} color={color} />);

  return (
    <>
      <div className="tutorial-page">
        <p>
          Palettejuicer's focus is on letting you pick colors within the <b>sRGB</b> colorspace that has been in common
          use among computer displays since the 90's. But this space only represents a small amount of the colors the
          human eye can see.
        </p>
        <p>
          When working with colors in spaces like LAB/LCH, you are very likely to produce colors that are outside the
          range of <b>sRGB</b>. Such colors are considered <i>out of gamut</i>. Palettejuicer will warn you when this
          happens, by dressing up the offending color sliders in big, scary caution stripes:
        </p>
        <ColorSelector color={REALLY_OUT_OF_GAMUT_COLOR} computed={false} onColorChange={(_) => {}} />
        <p>
          As you can see, the <b>blue</b> component is outside the range of <i>0-255</i>. What you see in the color
          preview is the <b>clipped</b> color, where we simply cap the blue at 255. However, this gives a result that's
          significantly different from what the original <b>OkLCH</b> color is trying to express. We could leave the
          color clipped like this, but a better way is to try reducing <b>chroma</b> and adjusting <b>lightness</b>{" "}
          until the color is within range:
        </p>
        <ColorSelector color={IN_GAMUT_COLOR} computed={false} onColorChange={(_) => {}} />
        <p>Let's put this side by side with the clipped color:</p>
        <div className="color-container">
          <div className="palette-row">
            <PaletteCel color={CLIPPED_GAMUT_COLOR} />
            <PaletteCel color={IN_GAMUT_COLOR} />
          </div>
        </div>
        <p>
          Well, it's less vivid, but now we can see that the color was supposed to be lavender, rather than purple! If
          you mouse over the color on the left, you'll notice that <b>clipping</b> the blue component resulted in the
          color's <b>hue</b> changing from <i>285</i> to <i>301</i>! So remember to always keep your colors in-gamut.
        </p>
        <p>
          In addition to the color sliders, Palettejuicer will also helpfully mark any out-of-gamut colors in the
          palette itself:
        </p>
        <div className="color-container">
          <div className="palette-row">
            <PaletteCel color={IN_GAMUT_COLOR} />
            <PaletteCel color={OUT_OF_GAMUT_COLOR} />
            <PaletteCel color={REALLY_OUT_OF_GAMUT_COLOR} />
          </div>
        </div>
        <p>
          If a color is out-of-gamut, it's marked with an <b>(!)</b> exclamation point. If any individual <b>RGB</b>{" "}
          component is out of range by more than 20%, the color is considered <b>really</b> out-of-gamut and is given
          two <b>(!!)</b> exclamation points. Such colors are more likely to have significant differences when brought
          in-gamut.
        </p>
        <p>
          Sometimes you may end up with lots of out-of-gamut colors, especially as the result of calculations over
          LAB/LCH-like colorspaces. To address this, you can use the <b>Gamut Map to sRGB</b> calculation. This will use
          an algorithm to try and automatically bring colors in-gamut:
        </p>
        <div className="color-container color-container-large">
          <div className="palette-row">{outOfGamutShades}</div>
        </div>
        <div className="color-container color-container-large">
          <div className="palette-row">{inGamutShades}</div>
        </div>
        <p>
          Don't rely on this too much. It's an algorithm, so it's not perfect. Try to bring your colors in-gamut through
          manual adjustment first before resorting to this. In particular, it helps if you raise <b>chroma</b> in your
          midtones, and lower it in your highlights and shadows. If you're using <b>Extrapolate Strip</b>, the{" "}
          <b>Midrange boost</b> can help you accomplish this.
        </p>
      </div>
    </>
  );
}
