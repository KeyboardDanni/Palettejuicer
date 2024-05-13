export function SavingWorkPage() {
  return (
    <>
      <div className="tutorial-page">
        <p>
          Your palette colors and calculations are all part of a <b>project</b>. Palettejuicer will automatically save
          your work to your browser's local storage when you make changes, or when you close the app.
        </p>
        <p>
          Don't rely on browser storage forever. The contents of this storage may get erased, causing you to lose your
          work. You should save your changes to your local drive from time to time by clicking <b>File</b>, then{" "}
          <b>Save Project File</b>. This will save the <b>project</b>, which contains your precise colors and
          calculations in JSON format, into a folder of your choosing for safekeeping. You can load it again later with{" "}
          <b>Load Project File</b>.
        </p>
        <p>
          This is a Palettejuicer-specific file, though. When it's time to import these colors into a graphics program
          like{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://www.aseprite.org/">
            Aseprite
          </a>
          , you will need to <i>export</i> your colors. Just click <b>File</b>, then click <b>Export</b> and choose your
          desired file format. You can then load the resulting file in your graphics editor, for example by using the{" "}
          <b>Load Palette</b> option.
        </p>
        <p>
          Remember that your exported file has just the "baked down" colors and does not contain any calculations or
          precise colorspace information, so you should hold onto your <b>project file</b> in case you want to make
          changes later.
        </p>
        <p>
          You can also copy individual cels from Palettejuicer with <i>Ctrl + C</i> (or tap and hold on mobile). This
          lets you copy colors around within the project while retaining all their colorspace information. It will also
          copy the hex code to your OS clipboard so you can paste it into other applications. Additionally, you can copy
          colors from these external apps and paste them into Palettejuicer, though hexadecimal codes are currently the
          only supported format.
        </p>
      </div>
    </>
  );
}
