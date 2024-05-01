import { ChangeEvent, useState } from "react";
import { castDraft, produce } from "immer";

import { Color } from "../../model/color/Color";
import { ChannelInfo, Colorspace } from "../../model/color/Colorspace";
import { ControlledTextInput } from "./ControlledTextInput";
import { NumberSlider } from "./NumberSlider";
import { ColorspaceRgb } from "../../model/color/ColorspaceRgb";
import { PageTab } from "./PageTab";

enum ColorSelectorPage {
  Oklch = "OkLCH",
  Oklab = "OkLAB",
  Lch = "LCH",
  Lab = "LAB",
  Hsl = "HSL",
  Hsv = "HSV",
}

type ChannelSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  label: string;
  min: number;
  max: number;
  step: number;
};

function ChannelSlider(props: ChannelSliderProps) {
  return (
    <>
      <div className="color-slider">
        <span className="label-left">{props.label}</span>
        <NumberSlider
          value={props.value}
          onChange={props.onChange}
          min={props.min}
          max={props.max}
          step={props.step}
          disabled={props.disabled}
        />
      </div>
    </>
  );
}

type HexInputProps = {
  color: Color;
  onColorChange: (color: Color) => void;
  disabled: boolean;
};

function HexInput(props: HexInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newColor = Color.fromHex(event.target.value);

    if (newColor !== null) {
      props.onColorChange(newColor);
    }
  }

  return (
    <>
      <ControlledTextInput value={props.color.rgb.hex} onChange={handleChange} disabled={props.disabled} />
    </>
  );
}

type ColorspaceSlidersProps = {
  colorspace: string;
  channels: ChannelInfo[];
  color: Color;
  onColorChange: (color: Color) => void;
  disabled: boolean;
};

function ColorspaceSliders(props: ColorspaceSlidersProps) {
  const converted = props.color.converted(props.colorspace).data;
  const transformed = converted.transformed();

  function handleChannelChange(channel: number, value: number) {
    if (value === transformed[channel]) {
      return;
    }

    const spaceClass = converted.constructor as typeof Colorspace;
    transformed[channel] = value;

    const color = produce(props.color, (draft) => {
      const data = produce(converted, (dataDraft) => {
        dataDraft.values = spaceClass.transformedToRaw(transformed);
      });

      draft.data = castDraft(data);
    });

    props.onColorChange(color);
  }

  const sliders = [];

  for (const [i, channel] of props.channels.entries()) {
    sliders.push(
      <ChannelSlider
        key={channel.channel}
        value={transformed[i]}
        onChange={(value) => handleChannelChange(i, value)}
        label={channel.label}
        min={channel.range[0]}
        max={channel.range[1]}
        step={channel.step}
        disabled={props.disabled}
      />
    );
  }

  return sliders;
}

type PageSlidersProps = {
  page: string;
  color: Color;
  computed: boolean;
  onColorChange: (color: Color) => void;
};

function PageSliders(props: PageSlidersProps) {
  let colorspace = "";

  switch (props.page) {
    case ColorSelectorPage.Oklch:
      colorspace = "oklch";
      break;
    case ColorSelectorPage.Oklab:
      colorspace = "oklab";
      break;
    case ColorSelectorPage.Lch:
      colorspace = "lch";
      break;
    case ColorSelectorPage.Lab:
      colorspace = "lab";
      break;
    case ColorSelectorPage.Hsl:
      colorspace = "hsl";
      break;
    case ColorSelectorPage.Hsv:
      colorspace = "hsv";
      break;
    default:
      throw new Error("Bad enum");
  }

  const channels = Color.channelInfo(colorspace);

  return (
    <>
      <ColorspaceSliders
        colorspace={colorspace}
        channels={channels}
        color={props.color}
        onColorChange={props.onColorChange}
        disabled={props.computed}
      />
    </>
  );
}

export type ColorSelectorProps = {
  color: Color;
  computed: boolean;
  onColorChange: (color: Color) => void;
};

export function ColorSelector(props: ColorSelectorProps) {
  const [page, setPage] = useState<string>(ColorSelectorPage.Oklch);

  function tryColorChange(color: Color) {
    if (!props.computed) {
      props.onColorChange(color);
    }
  }

  return (
    <>
      <div className="color-selector">
        <div className="color-sliders">
          <div>
            <ColorspaceSliders
              colorspace="rgb"
              channels={ColorspaceRgb.channelInfo()}
              color={props.color}
              onColorChange={tryColorChange}
              disabled={props.computed}
            />
          </div>
          <div>
            <div className="tabbar">
              <PageTab pageName={ColorSelectorPage.Oklch} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Oklab} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Lch} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Lab} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Hsl} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Hsv} onPageChange={setPage} activePage={page} />
            </div>
            <PageSliders page={page} color={props.color} computed={props.computed} onColorChange={tryColorChange} />
          </div>
        </div>
        <div className="color-preview-column">
          <div className="color-preview" style={{ backgroundColor: props.color.hex }} />
          <div className="color-hex">
            <HexInput color={props.color} onColorChange={tryColorChange} disabled={props.computed} />
          </div>
        </div>
      </div>
    </>
  );
}
