import { castDraft, produce } from "immer";

import { DEFAULT_PALETTE_WIDTH, PALETTE_MAX_WIDTH, PALETTE_MIN_WIDTH, Palette } from "../../model/Palette";
import { Exporter } from "./Exporter";
import { ColorspaceRgb } from "../../model/color/ColorspaceRgb";
import { Color } from "../../model/color/Color";
import { FiletypeInfo } from "../FilePicker";

export class GnuPaletteExporter extends Exporter {
  static filetypeInfo(): FiletypeInfo {
    return {
      description: "GNU Palette",
      extensions: ["gpl"],
      mimetype: "text/plain",
      suggestedName: "palette.gpl",
    };
  }

  static async import(buffer: ArrayBuffer): Promise<Palette> {
    const decoder = new TextDecoder();
    const contents = decoder.decode(buffer);

    const lines = contents.split(/\r?\n/);

    if (lines[0].trim() !== "GIMP Palette") {
      throw new Error("Not a valid .gpl file");
    }

    let readWidth = DEFAULT_PALETTE_WIDTH;
    const readColors: Color[] = [];

    for (const [i, line] of lines.entries()) {
      if (i < 1) continue;

      const trimmed = line.trim();

      if (trimmed.length <= 0 || trimmed.startsWith("#") || trimmed.startsWith("Name:")) {
        continue;
      }

      if (trimmed.startsWith("Columns:")) {
        const numberString = trimmed.replace("Columns:", "").trim();
        const columns = parseInt(numberString);

        if (columns >= PALETTE_MIN_WIDTH && columns <= PALETTE_MAX_WIDTH) {
          readWidth = columns;
        }

        continue;
      }

      const components = trimmed.split(/[\s]+/);

      if (components.length < 3) continue;

      const values = components.slice(0, 3).map((text) => parseInt(text));
      readColors.push(new Color(ColorspaceRgb.fromTransformed(values)));
    }

    const palette = produce(new Palette(readWidth, Math.ceil(Math.max(readColors.length, 1) / readWidth)), (draft) => {
      for (const [i, color] of readColors.entries()) {
        draft.baseColors[i] = castDraft(color);
      }
    });

    return palette;
  }

  static async export(palette: Palette): Promise<ArrayBuffer> {
    const name = palette.paletteName.length > 0 ? palette.paletteName : "Untitled Palette";
    let contents = `GIMP Palette\nName: ${name}\nColumns: ${palette.width}\n#`;

    for (const color of palette.colors()) {
      contents += "\n" + color.rgb.intNormalized().join(" ");
    }

    const encoder = new TextEncoder();

    return encoder.encode(contents);
  }
}
