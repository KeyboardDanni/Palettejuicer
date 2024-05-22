import { castDraft, produce } from "immer";

import { DEFAULT_PALETTE_WIDTH, Palette } from "../../model/Palette";
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

    const readColors: Color[] = [];

    for (const [i, line] of lines.entries()) {
      if (i < 2) continue;

      const trimmed = line.trim();
      const components = trimmed.split(" ");

      if (components.length < 3) continue;

      const values = components.map((text) => parseInt(text));
      readColors.push(new Color(ColorspaceRgb.fromTransformed(values)));
    }

    const palette = produce(
      new Palette(DEFAULT_PALETTE_WIDTH, Math.ceil(Math.max(readColors.length, 1) / DEFAULT_PALETTE_WIDTH)),
      (draft) => {
        for (const [i, color] of readColors.entries()) {
          draft.baseColors[i] = castDraft(color);
        }
      }
    );

    return palette;
  }

  static async export(palette: Palette): Promise<ArrayBuffer> {
    const colors = palette.colors();
    let contents = `JASC-PAL\r\n0100\r\n${colors.length}`;

    for (const color of colors) {
      contents += "\r\n" + color.rgb.intNormalized().join(" ");
    }

    const encoder = new TextEncoder();

    return encoder.encode(contents);
  }
}
