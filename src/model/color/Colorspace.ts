import { immerable } from "immer";
import { spaceToSpace } from "../../util/colorjs";
import { Transform } from "class-transformer";

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

  @Transform((options) => options.value.map((value: any) => (value !== null ? value : Number.NaN)))
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

  converted<T extends Colorspace>(classType: { new (values: number[]): T; colorspaceName(): string }): T {
    if (classType === this.constructor) {
      return this as unknown as T;
    }

    return spaceToSpace(this, classType.colorspaceName()) as T;
  }

  describe(): string {
    const colorspaceClass = this.constructor as typeof Colorspace;
    const name = colorspaceClass.colorspaceName();
    const values = colorspaceClass
      .rawToTransformed(this.values)
      .map((value) => (!Number.isNaN(value) ? parseFloat(value.toPrecision(4)) : "None"));
    const valuesString = values.join(", ");

    return `${name}(${valuesString})`;
  }

  static channelInfo(): ChannelInfo[] {
    throw new Error("Method not implemented.");
  }
}
