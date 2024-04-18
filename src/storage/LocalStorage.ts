import { instanceToPlain, plainToInstance } from "class-transformer";

const STORAGE_NAME = "Palettejuicer_";

export class LocalStorage {
  static load<T>(name: string, classType: { new (): T }): T {
    const json = window.localStorage.getItem(STORAGE_NAME + name);

    if (!json) {
      return new classType();
    }

    const parsed = JSON.parse(json);
    const data = plainToInstance<T, any>(classType, parsed);

    return data;
  }

  static save(name: string, item: object) {
    window.localStorage.setItem(STORAGE_NAME + name, JSON.stringify(instanceToPlain(item)));
  }
}
