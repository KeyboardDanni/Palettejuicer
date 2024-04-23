import Colorjs from "colorjs.io";
import { immerable } from "immer";

export enum ChannelType {
  None,
  IsLightness,
  IsChroma,
  IsSaturation,
  IsHue,
}

export interface ChannelInfo {
  channel: string;
  label: string;
  channelType: ChannelType;
  range: [number, number];
  step: number;
}

export abstract class Colorspace {
  [immerable] = true;

  readonly values: readonly number[] = [];

  protected constructor(values: number[]) {
    this.values = values;
  }

  static colorspaceName(): string {
    throw new Error("Method not implemented.");
  }
  static rawToTransformed(raw: readonly number[]): number[] {
    return [...raw];
  }
  static transformedToRaw(transformed: readonly number[]): number[] {
    return [...transformed];
  }

  static fromTransformed(transformed: readonly number[]): Colorspace {
    const raw = this.transformedToRaw(transformed);

    return new (this as any)(raw);
  }

  transformed(): number[] {
    const colorspaceClass = this.constructor as typeof Colorspace;
    return colorspaceClass.rawToTransformed(this.values);
  }

  converted<T extends Colorspace>(classType: { new (): T }): T {
    if (classType === this.constructor) {
      return this as unknown as T;
    }

    const converter = this.converter();
    const converted = new classType().compute(converter);

    return converted as T;
  }
  abstract compute(converter: Colorjs): ThisType<this>;
  abstract converter(): Colorjs;
  static channelInfo(): ChannelInfo[] {
    throw new Error("Method not implemented.");
  }
}
