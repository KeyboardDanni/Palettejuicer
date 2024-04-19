import { instanceToPlain, plainToInstance } from "class-transformer";

export function deserialize<T>(json: string | null, classType: { new (): T }): T {
  if (!json) {
    return new classType();
  }

  const parsed = JSON.parse(json);
  const data = plainToInstance<T, any>(classType, parsed);

  return data;
}

export function serialize(item: object) {
  return JSON.stringify(instanceToPlain(item));
}
