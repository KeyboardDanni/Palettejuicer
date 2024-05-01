export function SavingWorkPage() {
  return (
    <>
      <div className="tutorial-page">
        <p>
          Your palette colors and calculations are all part of a <b>project</b>. Palettejuicer will automatically save
          your work to your browser's local storage when you make changes, or when you close the app.
        </p>
        <p>
          Don't rely on local storage forever. The contents of this storage may get erased, causing you to lose your
          work. You should save your changes to your local drive from time to time by clicking <b>File</b>, then{" "}
          <b>Save to JSON</b>. This will save the project file, which contains your precise colors and calculations,
          into a folder of your choosing for safekeeping. You can load it again later with <b>Load from JSON</b>.
        </p>
        <p>
          This is a Palettejuicer-specific file, though. When it's time to import these colors into your graphics
          program, you can copy cels from Palettejuicer with <i>Ctrl + C</i>. This lets you copy colors around within
          the project while retaining all their colorspace information. It will also copy the hex code to your OS
          clipboard so you can paste it into other applications. Additionally, you can copy colors from these external
          apps and paste them into Palettejuicer, though hexadecimal codes are currently the only supported format.
        </p>
        <p>
          In the future, you will be able to export your work to one of several common palette formats that can be read
          by other applications, as well as import existing palette files into Palettejuicer.
        </p>
      </div>
    </>
  );
}
