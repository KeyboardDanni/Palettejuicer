import { castDraft, produce } from "immer";

import { PALETTE_WIDTH, Palette } from "../../model/Palette";
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

    const palette = produce(new Palette(), (draft) => {
      let index = 0;

      for (const [i, line] of lines.entries()) {
        if (i < 1) continue;

        const trimmed = line.trim();

        // TODO: When we add custom palette sizes, use Columns to control the imported palette width
        if (
          trimmed.length <= 0 ||
          trimmed.startsWith("#") ||
          trimmed.startsWith("Name:") ||
          trimmed.startsWith("Columns:")
        ) {
          continue;
        }

        const components = trimmed.split(/[\s]+/);

        if (components.length < 3) continue;

        const values = components.slice(0, 3).map((text) => parseInt(text));

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
    const name = palette.paletteName.length > 0 ? palette.paletteName : "Untitled Palette";
    let contents = `GIMP Palette\nName: ${name}\nColumns: ${PALETTE_WIDTH}\n#`;

    for (const color of palette.colors()) {
      contents += "\n" + color.rgb.intNormalized().join(" ");
    }

    const encoder = new TextEncoder();

    return encoder.encode(contents);
  }
}
