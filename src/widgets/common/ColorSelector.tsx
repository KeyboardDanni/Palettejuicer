import { ChangeEvent, useState } from "react";

import { Color } from "../../model/color/Color";
import { ColorspaceInfo } from "../../model/color/Colorspace";
import { ControlledTextInput } from "./ControlledTextInput";

enum ColorSelectorPage {
  Lch = "LCH",
  Lab = "LAB",
  Oklch = "OkLCH",
  Oklab = "OkLAB",
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

const GAMUT_ROUNDING_ERROR = 0.0001;

function ChannelSlider(props: ChannelSliderProps) {
  const displayValue = props.step >= 1 ? Math.round(props.value * 10) / 10 : props.value;
  const min = props.min - GAMUT_ROUNDING_ERROR;
  const max = props.max + GAMUT_ROUNDING_ERROR;
  const className = props.value < min || props.value > max ? "out-of-gamut" : "";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value) || 0;

    props.onChange(value);
  }

  return (
    <>
      <div className="color-slider">
        <span className="label-left">{props.label}</span>
        <input
          type="range"
          className={className}
          value={props.value}
          onChange={handleChange}
          min={props.min}
          max={props.max}
          step={props.step}
          disabled={props.disabled}
        />
        <ControlledTextInput
          value={props.value.toString()}
          title={props.value.toString()}
          displayValue={displayValue.toString()}
          inputMode="decimal"
          onChange={handleChange}
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
  colorspace: ColorspaceInfo;
  color: Color;
  onColorChange: (color: Color) => void;
  disabled: boolean;
};

function ColorspaceSliders(props: ColorspaceSlidersProps) {
  const colorspace = props.colorspace.colorspace;

  function handleChannelChange(channel: string, value: number) {
    if (value !== props.color.channel(colorspace, channel)) {
      props.onColorChange(props.color.adjustChannel(colorspace, channel, value));
    }
  }

  const sliders = [];

  for (const channel of props.colorspace.channels) {
    sliders.push(
      <ChannelSlider
        key={channel.channel}
        value={props.color.channel(colorspace, channel.channel)}
        onChange={(value) => handleChannelChange(channel.channel, value)}
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

type PageTabProps = {
  pageName: string;
  onPageChange: (value: string) => void;
  activePage: string;
};

function PageTab(props: PageTabProps) {
  function handlePageChange(event: ChangeEvent<HTMLInputElement>) {
    props.onPageChange(event.target.value);
  }

  return (
    <>
      <label className="tabbar-tab">
        <input
          type="radio"
          name="colorspace"
          value={props.pageName}
          onChange={handlePageChange}
          checked={props.pageName === props.activePage}
        />
        <span>{props.pageName}</span>
      </label>
    </>
  );
}

type PageSlidersProps = {
  page: string;
  color: Color;
  computed: boolean;
  onColorChange: (color: Color) => void;
};

function PageSliders(props: PageSlidersProps) {
  let colorspace;

  switch (props.page) {
    case ColorSelectorPage.Lch:
      colorspace = Color.colorspaceInfo("lch");
      break;
    case ColorSelectorPage.Lab:
      colorspace = Color.colorspaceInfo("lab");
      break;
    case ColorSelectorPage.Oklch:
      colorspace = Color.colorspaceInfo("oklch");
      break;
    case ColorSelectorPage.Oklab:
      colorspace = Color.colorspaceInfo("oklab");
      break;
    case ColorSelectorPage.Hsl:
      colorspace = Color.colorspaceInfo("hsl");
      break;
    case ColorSelectorPage.Hsv:
      colorspace = Color.colorspaceInfo("hsv");
      break;
    default:
      throw new Error("Bad enum");
  }

  return (
    <>
      <ColorspaceSliders
        colorspace={colorspace}
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
  const [page, setPage] = useState<string>(ColorSelectorPage.Lch);

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
              colorspace={Color.colorspaceInfo("rgb")}
              color={props.color}
              onColorChange={tryColorChange}
              disabled={props.computed}
            />
          </div>
          <div>
            <div className="tabbar">
              <PageTab pageName={ColorSelectorPage.Lch} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Lab} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Oklch} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Oklab} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Hsl} onPageChange={setPage} activePage={page} />
              <PageTab pageName={ColorSelectorPage.Hsv} onPageChange={setPage} activePage={page} />
            </div>
            <PageSliders page={page} color={props.color} computed={props.computed} onColorChange={tryColorChange} />
          </div>
        </div>
        <div className="color-preview-column">
          <div className="color-preview" style={{ backgroundColor: props.color.rgb.hex }} />
          <div className="color-hex">
            <HexInput color={props.color} onColorChange={tryColorChange} disabled={props.computed} />
          </div>
        </div>
      </div>
    </>
  );
}
