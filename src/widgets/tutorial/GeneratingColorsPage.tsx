import { appendSteps, range, steps } from "../../util/math";
import { Color } from "../../model/color/Color";
import { ColorspaceOklch } from "../../model/color/ColorspaceOklch";
import { ColorspaceRgb } from "../../model/color/ColorspaceRgb";
import { PaletteCel } from "../sections/PaletteView";

const COLOR_NULL = new Color(new ColorspaceRgb([0, 0, 0]));

const COLOR_SHADES_L_STEPS = steps(90, 35, 9);
const COLOR_SHADES_C_STEPS = appendSteps(steps(5, 24, 5), 8, 5);

const COLOR_SHADES = range(0, 10, 1).map((i) => {
  return new Color(ColorspaceOklch.fromTransformed([COLOR_SHADES_L_STEPS[i], COLOR_SHADES_C_STEPS[i], 0]));
});

const COLOR_VALUES_CHAINED = [
  [
    [58, 23, 0],
    [66, 21.75, 25],
    [72.45861705227402, 18.89553990327287, 50.97166034592618],
    [80.979125800285, 17.03576820769409, 75.63900691934776],
    [90, 18, 100],
  ],
  [null, null, [78.8347740317354, 14.088525138506553, 54.25514694831986], null, null],
  [null, null, [85.58865669353098, 9.123605448662357, 55.03292754036215], null, null],
  [null, null, [92, 4, 55], null, null],
];

const COLOR_VALUES_CHAINED_BAD_ORDER = [
  COLOR_VALUES_CHAINED[0],
  [null, null, [30.66666666666667, 1.3333333333333128, 55], null, null],
  [null, null, [61.33333333333334, 2.6666666666666257, 55], null, null],
  [null, null, [92, 4, 55], null, null],
];

function mapShade(shadeIndexes: (number | null)[]) {
  return shadeIndexes.map((value, i) => (
    <PaletteCel key={i} color={value !== null ? COLOR_SHADES[value] : COLOR_NULL} />
  ));
}

function map2dColorValues(values: (number[] | null)[][]) {
  const rows = [];

  for (const [x, rowValues] of values.entries()) {
    const row = [];

    for (const [y, columnValues] of rowValues.entries()) {
      let color;

      if (columnValues === null) {
        color = COLOR_NULL;
      } else {
        color = new Color(ColorspaceOklch.fromTransformed(columnValues));
      }

      row.push(<PaletteCel key={y} color={color} />);
    }

    rows.push(
      <div key={x} className="palette-row">
        {row}
      </div>
    );
  }

  return rows;
}

export function GeneratingColorsPage() {
  const shadesStart = mapShade([0, null, null, null, 4, null, null, null, 8]);
  const shadesPartial = mapShade([0, 1, 2, 3, 4, null, null, null, 8]);
  const shadesFinal = mapShade([0, 1, 2, 3, 4, 5, 6, 7, 8]);

  const chained = map2dColorValues(COLOR_VALUES_CHAINED);
  const chainedBadOrder = map2dColorValues(COLOR_VALUES_CHAINED_BAD_ORDER);

  return (
    <>
      <div className="tutorial-page">
        <p>
          Selecting colors by hand is all well and good, but Palettejuicer's <i>raison d'être</i> is generating new,
          evenly-spaced shades so you don't have to pick them all manually. So let's generate some colors.
        </p>
        <p>
          First, we will need some <b>Base Colors</b>. Select three colors: a <i>highlight</i>, a <i>midtone</i>, and a{" "}
          <i>shadow</i>. Make sure to space them out so you can generate more shades inbetween. You should have
          something that looks like this:
        </p>
        <div className="color-container color-container-large">
          <div className="palette-row">{shadesStart}</div>
        </div>
        <p>
          Now, here's where <b>Calculations</b> come in. A <b>Calculation</b> takes colors from your palette and
          generates new ones. The resulting <b>Calculated Colors</b> are then placed onto your palette. We want a{" "}
          <b>Calculation</b> that generates new colors between two <b>Base Colors</b>, and the <b>Interpolate Strip</b>{" "}
          calculation is just what we're looking for.
        </p>
        <p>
          In the <b>Calculations</b> pane, click on <b>Add</b> and select <b>Interpolate Strip</b> from the menu.
        </p>
        <p>
          You'll now see a number of settings in the <b>Properties</b> pane below. For now, let's just focus on the{" "}
          <b>Cel range</b>. This is the region we want to generate our new shades over.
        </p>
        <p>
          Let's start by generating the shades between the <i>highlight</i> and the <i>midtone</i>. Next to{" "}
          <b>Cel range</b>, click on the first <i className="icon-pick"></i> <b>Pick cel</b> button, then click your{" "}
          <i>highlight</i>. Click the second <i className="icon-pick"></i> <b>Pick cel</b> button, then click your{" "}
          <i>midtone</i>. You should now see something like this:
        </p>
        <div className="color-container color-container-large">
          <div className="palette-row">{shadesPartial}</div>
        </div>
        <p>
          Now let's make a second calculation that covers the rest of our shades. Go to the <b>Calculations</b> pane and
          click on <b>Clone</b> to make a copy of your calculation. Adjust this new one so it goes from the{" "}
          <i>midtone</i> to the <i>shadow</i>. You should be seeing this:
        </p>
        <div className="color-container color-container-large">
          <div className="palette-row">{shadesFinal}</div>
        </div>
        <p>
          Congratulations! You have just generated your first set of colors! Feel free to edit any of your{" "}
          <b>Base Colors</b> and watch the <b>Computed Colors</b> update in realtime!
        </p>
        <p>
          Keep in mind that these <b>Computed Colors</b> are placed in a layer above your <b>Base Colors</b>. You can't
          edit <b>Computed Colors</b> directly in the selector, but if one gets placed on top of a <b>Base Color</b> you
          want to modify, simply click on the <b>Edit Base</b> checkbox to view and edit the base instead.
        </p>
        <p>
          While you can't edit <b>Computed Colors</b>, you can use them as the basis for additional calculations. This
          example takes an <i>orange</i> calculated from a gradient between <i>rose</i> and <i>yellow</i>, and generates
          some new highlights:
        </p>
        <div className="color-container">{chained}</div>
        <p>
          The order of your calculations matters! Calculations higher up in the list are processed first, meaning their
          results are available only to calculations below them. If the vertical strip were calculated first, it would
          be taking the background color instead of the calculated orange, and you would get this instead:
        </p>
        <div className="color-container">{chainedBadOrder}</div>
        <p>
          You can reorder calculations by using the <i className="icon-up"></i> <b>Up</b> and{" "}
          <i className="icon-down"></i> <b>Down</b> buttons in the <b>Calculations</b> view. You can also enable or
          disable individual calculations to see their effects.
        </p>
        <p>
          There are more ways to generate colors, such as the <b>Extrapolate Strip</b> calculation, which lets you
          create a strip of colors from just one <b>Base Color</b>. Feel free to experiment and see what you can come up
          with!
        </p>
      </div>
    </>
  );
}
