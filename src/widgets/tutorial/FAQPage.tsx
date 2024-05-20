export function FAQPage() {
  return (
    <>
      <div className="tutorial-page">
        <h2>Q: The generated colors look uneven.</h2>
        <p>
          First, make sure that your display is calibrated correctly. Check the settings on your monitor (brightness,
          contrast, gamma, black boost, color balance, etc.), as well as your display drivers and operating system color
          profile. If you are using Chrome, you may need to force the color profile to <b>sRGB</b> within your flags.
          Copy and paste the following into your address bar: <code>chrome://flags/#force-color-profile</code>. Change
          the setting to <b>sRGB</b> and restart Chrome.
        </p>
        <p>
          If your display looks good, check to make sure that you aren't producing any colors that are significantly out
          of gamut. This includes colors before any gamut mapping, so disable any <b>Gamut Map</b> calculations and look
          for any colors with <b>(!!)</b> two exclamation points. Finally, some colorspaces are better for color ramps
          than others. LCH and OkLCH generally give the best results. RGB and regular HSL/HSV tend to be more
          inconsistent.
        </p>
        <h2>Q: I get an extra popup menu when I try to paste color cels.</h2>
        <p>
          This is a security mechanism in Firefox that's meant to prevent pages from reading your clipboard without you
          knowing, in lieu of a more formal permission system where you give consent upfront. It only happens if the
          clipboard contents come from outside the app. While I could disable OS clipboard functionality for this
          browser, I don't believe in taking features away from some users just to fix a papercut. Hopefully in the
          future, Firefox will detect user intent more intelligently.
        </p>
        <h2>Q: The sliders suddenly grayed out while I was adjusting a color.</h2>
        <p>
          You may have moved the color out of gamut while there was an active <b>Gamut Map</b> calculation. Disable the
          calculation (or toggle "Edit Base") when adjusting such colors.
        </p>
        <h2>Q: I have an issue that isn't mentioned here.</h2>
        <p>
          Feel free to open an issue on{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/KeyboardDanni/palettejuicer/issues">
            GitHub
          </a>
          .
        </p>
      </div>
    </>
  );
}
