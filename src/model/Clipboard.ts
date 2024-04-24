import { Color } from "./color/Color";

let warnedClipboardRead = false;
let warnedClipboardWrite = false;

export class Clipboard {
  private copiedColor: Color | null = null;

  async copy(color: Color) {
    this.copiedColor = color;

    try {
      await window.navigator.clipboard.writeText(color.hex);
    } catch (error) {
      if (!warnedClipboardWrite) {
        console.warn(
          "Writing OS clipboard failed. Either your browser doesn't support this or you haven't granted permission.\n" +
            error
        );
        warnedClipboardWrite = true;
      }
    }
  }

  async paste(): Promise<Color | null> {
    let color = this.copiedColor;

    // Try to read hex code from the system clipboard and fail gracefully on internal clipboard
    //  if this is not allowed.
    try {
      const osText = await window.navigator.clipboard.readText();
      const osColor = Color.fromHex(osText);

      // If we don't have a color, it's because the clipboard text wasn't a hex color code.
      if (osColor !== null) {
        const hex = this.copiedColor?.hex ?? "";

        // If the hex code from the OS clipboard matches the one on the internal clipboard,
        //  it's likely because it's from when we set the clipboard on our copy operation.
        //  Use the internal clipboard color in this case as it has more accurate colorspace
        //  information.
        if (hex !== osColor.hex) {
          color = osColor;

          // Make the user experience better for Firefox users by setting ourselves as the
          //  clipboard owner - this prevents the user having to deal with multiple Paste
          //  prompts when pasting the same external color a bunch of times.
          await this.copy(osColor);
        }
      }
    } catch (error) {
      if (!warnedClipboardRead) {
        console.warn(
          "Reading OS clipboard failed. Either your browser doesn't support this or you haven't granted permission.\n" +
            error
        );
        warnedClipboardRead = true;
      }
    }

    return color;
  }
}
