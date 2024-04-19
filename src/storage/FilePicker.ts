import { showOpenFilePicker, showSaveFilePicker } from "native-file-system-adapter";
import { deserialize, serialize } from "./Serialize";

const TYPES = [
  {
    description: "Palettejuicer Project JSON",
    accept: { "application/json": [".palettejuice"] },
  },
];

export class FilePicker {
  static async load<T>(classType: { new (): T }): Promise<T> {
    const handle = await showOpenFilePicker({
      multiple: false,
      // @ts-expect-error Need to specify types for native open dialog
      types: TYPES,
      accepts: [
        {
          extensions: ["palettejuice", "json"],
        },
      ],
    });
    const file = await handle[0].getFile();
    const json = await file.text();

    const data = deserialize(json, classType);

    return data;
  }

  static async save(item: object) {
    const blob = new Blob([serialize(item)]);
    const handle = await showSaveFilePicker({ suggestedName: "project.palettejuice", types: TYPES });

    const file = await handle.createWritable();
    await file.write(blob);
    await file.close();
  }
}
