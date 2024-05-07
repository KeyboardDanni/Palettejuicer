import { FilePicker, FiletypeInfo } from "../FilePicker";
import { Palette } from "../../model/Palette";

export abstract class Exporter {
  static filetypeInfo(): FiletypeInfo {
    throw new Error("Method not implemented.");
  }

  static async import(_buffer: ArrayBuffer): Promise<Palette> {
    throw new Error("Method not implemented.");
  }

  static async export(_palette: Palette): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.");
  }

  static async importWithPicker(): Promise<Palette> {
    const handle = await FilePicker.loadPicker(this.filetypeInfo());
    const file = await handle[0].getFile();
    const buffer = await file.arrayBuffer();

    return await this.import(buffer);
  }

  static async exportWithPicker(item: Palette) {
    const handle = await FilePicker.savePicker(this.filetypeInfo());
    const writable = await handle.createWritable();

    const buffer = await this.export(item);

    await writable.write(buffer);
    await writable.close();
  }
}
