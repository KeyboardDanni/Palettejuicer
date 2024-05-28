import { FileSystemFileHandle } from "native-file-system-adapter";

import { deserialize, serialize } from "./Serialize";
import { FilePicker } from "./FilePicker";
import { Project } from "../model/Project";

export const projectFiletypeInfo = {
  description: "Palettejuicer Project JSON",
  extensions: ["palettejuice", "json"],
  mimetype: "application/json",
  suggestedName: "project.palettejuice",
};

export class ProjectFile {
  static async load(handle: FileSystemFileHandle): Promise<Project> {
    const file = await handle.getFile();
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder();
    const json = decoder.decode(buffer);

    const data = deserialize(json, Project);

    return data;
  }

  static async save(item: Project, handle: FileSystemFileHandle) {
    const serialized = serialize(item);
    const encoder = new TextEncoder();
    const buffer = encoder.encode(serialized);

    const file = await handle.createWritable();
    await file.write(buffer);
    await file.close();
  }

  static async loadWithPicker(): Promise<Project> {
    const handle = await FilePicker.loadPicker(projectFiletypeInfo);

    return await ProjectFile.load(handle[0]);
  }

  static async saveWithPicker(item: Project) {
    const info = { ...projectFiletypeInfo };
    info.suggestedName = `${item.palette.paletteName}.palettejuice`;

    const handle = await FilePicker.savePicker(info);

    await ProjectFile.save(item, handle);
  }
}
