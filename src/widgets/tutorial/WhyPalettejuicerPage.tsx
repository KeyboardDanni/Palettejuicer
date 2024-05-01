export function WhyPalettejuicerPage() {
  return (
    <>
      <div className="tutorial-page">
        <p>
          Choosing colors is hard. Yet it is one of the most important aspects of creating artwork, and the colors you
          use can make or break a piece. This is especially important if you're working with a limited number of colors,
          like with <b>pixel art.</b>
        </p>
        <p>
          While there are many palettes out there, they are not one-size-fits-all. Moreover, if you're working with a
          large enough set of colors, you'll want to make specific colors for individual characters or objects in your
          scene. While you can certainly pick these colors out by hand, doing so is tedious and you may end up with
          uneven gradients of color.
        </p>
        <p>
          Many tools exist that allow you to generate palettes. However, most of these are simplistic or geared more
          toward user interface design and scientific visualization, rather than art. I wanted to make a tool that would
          help me create palettes that could suit my needs. Hence:
        </p>
        <div className="logo" title="Palettejuicer" />
        <p>
          Palettejuicer is an app that allows you to quickly create swaths of colors based on a few hand-picked cels.
          You can select two colors manually, and let the computer generate the in-betweens. Or pick a single color and
          generate both highlights and shadows from it. All your work happens on a 2D canvas, where you can explore
          relationships between colors however you see fit. I hope you find this app both useful and inspirational!
        </p>
      </div>
    </>
  );
}
