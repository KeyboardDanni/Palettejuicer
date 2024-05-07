import { castDraft, produce } from "immer";

import { PALETTE_HEIGHT, PALETTE_WIDTH, Palette } from "../../model/Palette";
import { Exporter } from "./Exporter";
import { ColorspaceRgb } from "../../model/color/ColorspaceRgb";
import { Color } from "../../model/color/Color";
import { FiletypeInfo } from "../FilePicker";

export class JascPalExporter extends Exporter {
  static filetypeInfo(): FiletypeInfo {
    return {
      description: "JASC Palette",
      extensions: ["pal"],
      mimetype: "text/plain",
      suggestedName: "palette.pal",
    };
  }

  static async import(buffer: ArrayBuffer): Promise<Palette> {
    const decoder = new TextDecoder();
    const contents = decoder.decode(buffer);

    const lines = contents.split(/\r?\n/);

    if (lines.length < 3 || lines[0].trim() !== "JASC-PAL" || lines[1].trim() !== "0100") {
      throw new Error("Not a valid JASC .pal file");
    }

    const palette = produce(new Palette(), (draft) => {
      let index = 0;

      for (const [i, line] of lines.entries()) {
        if (i < 2) continue;

        const trimmed = line.trim();
        const components = trimmed.split(" ");

        if (components.length < 3) continue;

        const values = components.map((text) => parseInt(text));

        // TODO: When we add custom palette sizes, make sure we remove this check
        if (index < draft.baseColors.length) {
          draft.baseColors[index] = castDraft(new Color(ColorspaceRgb.fromTransformed(values)));
          index++;
        }
      }
    });

    return palette;
  }

  static async export(palette: Palette): Promise<ArrayBuffer> {
    let contents = `JASC-PAL\r\n0100\r\n${PALETTE_WIDTH * PALETTE_HEIGHT}`;

    for (const color of palette.colors()) {
      contents += "\r\n" + color.rgb.intNormalized().join(" ");
    }

    const encoder = new TextEncoder();

    return encoder.encode(contents);
  }
}
