import { instanceToPlain, plainToInstance } from "class-transformer";
import { produce } from "immer";

export function deserialize<T>(json: string | null, classType: { new (): T; _migrate?(data: any): void }): T {
  if (!json) {
    return new classType();
  }

  const parsed = JSON.parse(json);
  if (classType._migrate) {
    classType._migrate(parsed);
  }
  const data = plainToInstance<T, any>(classType, parsed);

  return data;
}

export function serialize(item: object) {
  let json = "";

  // Needed to avoid issues with frozen objects from immer causing problems in class-transformer
  produce(item, (draft) => {
    json = JSON.stringify(instanceToPlain(draft));
  });

  return json;
}
