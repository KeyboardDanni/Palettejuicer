import { ChangeEvent, ChangeEventHandler, useState } from "react";

import Color from "../model/color/Color";
import { ControlledTextInput } from "./ControlledTextInput";

enum ColorSelectorPage {
  Hsl = "HSL",
  Hsv = "HSV",
}

function backgroundColorStyle(color: Color) {
  const [red, green, blue] = color.rgb.intNormalized();

  return {
    backgroundColor: `rgb(${red} ${green} ${blue})`
  }
}

type ChannelSliderProps = {
  value: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label: string;
  min: number;
  max: number;
  step: number;
};

function ChannelSlider({ value, onChange, label, min, max, step }: ChannelSliderProps) {
  const displayValue = (step >= 1 ? (Math.round(value * 10) / 10).toString() : value.toString());
  const className = (value < min || value > max ? "out-of-gamut" : "");

  return (
  <>
    <div className="color-slider">
      <span className="label-left">{label}</span>
      <input type="range" className={className} value={value} onChange={onChange} min={min} max={max} step={step} />
      <ControlledTextInput value={value.toString()} displayValue={displayValue} onChange={onChange}
          inputMode="decimal"/>
    </div>
  </>
  )
}

type HexInputProps = {
  color: Color;
  onColorChange: (color: Color) => void;
};

function HexInput({color, onColorChange}: HexInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newColor = Color.fromHex(event.target.value);

    if (newColor !== null) {
      onColorChange(newColor);
    }
  }

  return (
    <>
      <ControlledTextInput value={color.hex} onChange={handleChange} />
    </>
  )
}

type ColorSelectorProps = {
  color: Color;
  onColorChange: (color: Color) => void;
};

function ColorSelector({color, onColorChange}: ColorSelectorProps) {
  const [page, setPage] = useState<string>(ColorSelectorPage.Hsl);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPage(event.target.value);
  }

  function pageRadioButton(pageName: ColorSelectorPage) {
    return (
      <>
        <label className="tabbar-tab"><input type="radio" name="colorspace" value={pageName}
            onChange={handleChange} checked={page === pageName} /><span>{pageName}</span></label>
      </>
    );
  }

  function channelChanged(colorspace: string, channel: string, event: ChangeEvent<HTMLInputElement>) {
    const newValue = parseFloat(event.target.value) || 0;

    if (newValue !== color.channel(colorspace, channel)) {
      onColorChange(color.adjustChannel(colorspace, channel, newValue));
    }
  }

  function pageSliders() {
    switch (page) {
      case ColorSelectorPage.Hsl:
        return (
          <>
            <ChannelSlider value={color.hslv.hue} onChange={(e) => channelChanged("hslv", "hueL", e)}
              label={"H"} min={0} max={360} step={5} />
            <ChannelSlider value={color.hslv.saturationL} onChange={(e) => channelChanged("hslv", "saturationL", e)}
              label={"S"} min={0} max={100} step={2} />
            <ChannelSlider value={color.hslv.lightness} onChange={(e) => channelChanged("hslv", "lightness", e)}
              label={"L"} min={0} max={100} step={2} />
          </>
        );
      case ColorSelectorPage.Hsv:
        return (
          <>
            <ChannelSlider value={color.hslv.hue} onChange={(e) => channelChanged("hslv", "hueV", e)}
              label={"H"} min={0} max={360} step={5} />
            <ChannelSlider value={color.hslv.saturationV} onChange={(e) => channelChanged("hslv", "saturationV", e)}
              label={"S"} min={0} max={100} step={2} />
            <ChannelSlider value={color.hslv.value} onChange={(e) => channelChanged("hslv", "value", e)}
              label={"V"} min={0} max={100} step={2} />
          </>
        );
      default:
        throw new Error("Bad enum");
    }
  }

  return (
    <>
      <div className="color-selector">
        <div className="color-sliders">
          <div className="subsection">
            <ChannelSlider value={color.rgb.red} onChange={(e) => channelChanged("rgb", "red", e)}
              label={"R"} min={0} max={255} step={5} />
            <ChannelSlider value={color.rgb.green} onChange={(e) => channelChanged("rgb", "green", e)}
              label={"G"} min={0} max={255} step={5} />
            <ChannelSlider value={color.rgb.blue} onChange={(e) => channelChanged("rgb", "blue", e)}
              label={"B"} min={0} max={255} step={5} />
          </div>
          <div className="subsection">
            <div className="subsection-header">
              <div className="tabbar">
                {pageRadioButton(ColorSelectorPage.Hsl)}
                {pageRadioButton(ColorSelectorPage.Hsv)}
              </div>
            </div>
            {pageSliders()}
          </div>
        </div>
        <div className="color-preview-column">
          <div className="color-preview" style={backgroundColorStyle(color)} />
          <div className="color-hex">
            <HexInput color={color} onColorChange={onColorChange} />
          </div>
        </div>
      </div>
    </>
  )
}

export default ColorSelector;
