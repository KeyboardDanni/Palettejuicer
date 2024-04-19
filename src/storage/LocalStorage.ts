import { deserialize, serialize } from "./Serialize";

const STORAGE_NAME = "Palettejuicer_";

export class LocalStorage {
  static load<T>(name: string, classType: { new (): T }): T {
    const json = window.localStorage.getItem(STORAGE_NAME + name);
    const data = deserialize(json, classType);

    return data;
  }

  static save(name: string, item: object) {
    window.localStorage.setItem(STORAGE_NAME + name, serialize(item));
  }
}
