import { immerable } from "immer";
import { spaceToSpace, spaceToSpaceValues } from "../../util/colorjs";
import { Transform } from "class-transformer";
import { steps } from "../../util/math";

export const GAMUT_ROUNDING_ERROR = 0.0005;
const SLIDER_INFO_RESOLUTION = 128;

export enum ChannelType {
  None,
  IsLightness,
  IsChroma,
  IsSaturation,
  IsHue,
}

export interface SliderPreviewInfo {
  channelGradients: number[][][];
}

export function checkStopOutOfRgbGamut(stop: number[]): number[] {
  for (const value of stop) {
    if (value < -GAMUT_ROUNDING_ERROR || value > 1 + GAMUT_ROUNDING_ERROR) {
      return [1, 0, 1];
    }
  }

  return stop;
}

function mapRgbStopToCss(stop: number[]) {
  const colors = stop.map((value) => `${Math.floor(value * 255)}`).join(" ");
  return `rgb(${colors})`;
}

export function sliderInfoToCss(info: SliderPreviewInfo): string[] {
  const channelStyles: string[] = [];

  for (const channel of info.channelGradients) {
    const stops = [];

    for (const stop of channel) {
      stops.push(mapRgbStopToCss(stop));
    }

    const stopString = stops.join(", ");
    channelStyles.push(`linear-gradient(90deg, ${stopString})`);
  }

  return channelStyles;
}

export interface ChannelInfo {
  channel: string;
  label: string;
  channelType: ChannelType;
  range: [number, number];
  rangeTransformed: [number, number];
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

  sliderPreview(): SliderPreviewInfo {
    const colorspaceClass = this.constructor as typeof Colorspace;
    const channelInfo = colorspaceClass.channelInfo();
    const sliderInfo: SliderPreviewInfo = {
      channelGradients: [],
    };

    for (let i = 0; i < this.values.length; i++) {
      const channel: number[][] = [];
      const range = channelInfo[i].range;
      const channelSteps = steps(range[0], range[1], SLIDER_INFO_RESOLUTION);

      for (const step of channelSteps) {
        const channelValues = [...this.values];
        channelValues[i] = step;

        const converted = spaceToSpaceValues(channelValues, colorspaceClass.colorspaceName(), "rgb");
        const checked = checkStopOutOfRgbGamut(converted);

        channel.push(checked);
      }

      sliderInfo.channelGradients.push(channel);
    }

    return sliderInfo;
  }

  static channelInfo(): ChannelInfo[] {
    throw new Error("Method not implemented.");
  }
}
