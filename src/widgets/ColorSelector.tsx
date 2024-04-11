import { ChangeEvent, ChangeEventHandler, useState } from "react";

import { Color } from "../model/color/Color";
import { ControlledTextInput } from "./ControlledTextInput";

enum ColorSelectorPage {
  Hsl = "HSL",
  Hsv = "HSV",
  Lch = "LCH",
  Lab = "LAB",
  Oklch = "OkLCH",
  Oklab = "OkLAB",
}

type ChannelSliderProps = {
  value: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label: string;
  min: number;
  max: number;
  step: number;
};

function ChannelSlider(props: ChannelSliderProps) {
  const displayValue = props.step >= 1 ? (Math.round(props.value * 10) / 10).toString() : props.value.toString();
  const className = props.value < props.min || props.value > props.max ? "out-of-gamut" : "";

  return (
    <>
      <div className="color-slider">
        <span className="label-left">{props.label}</span>
        <input
          type="range"
          className={className}
          value={props.value}
          onChange={props.onChange}
          min={props.min}
          max={props.max}
          step={props.step}
        />
        <ControlledTextInput
          value={props.value.toString()}
          title={props.value.toString()}
          displayValue={displayValue}
          onChange={props.onChange}
          inputMode="decimal"
        />
      </div>
    </>
  );
}

type HexInputProps = {
  color: Color;
  onColorChange: (color: Color) => void;
};

function HexInput({ color, onColorChange }: HexInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newColor = Color.fromHex(event.target.value);

    if (newColor !== null) {
      onColorChange(newColor);
    }
  }

  return (
    <>
      <ControlledTextInput value={color.rgb.hex} onChange={handleChange} />
    </>
  );
}

type ColorSelectorProps = {
  color: Color;
  onColorChange: (color: Color) => void;
};

export function ColorSelector({ color, onColorChange }: ColorSelectorProps) {
  const [page, setPage] = useState<string>(ColorSelectorPage.Hsl);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPage(event.target.value);
  }

  function pageRadioButton(pageName: ColorSelectorPage) {
    return (
      <>
        <label className="tabbar-tab">
          <input type="radio" name="colorspace" value={pageName} onChange={handleChange} checked={page === pageName} />
          <span>{pageName}</span>
        </label>
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
            <ChannelSlider
              value={color.hslv.hue}
              onChange={(e) => channelChanged("hslv", "hueL", e)}
              label={"H"}
              min={0}
              max={360}
              step={5}
            />
            <ChannelSlider
              value={color.hslv.saturationL}
              onChange={(e) => channelChanged("hslv", "saturationL", e)}
              label={"S"}
              min={0}
              max={100}
              step={2}
            />
            <ChannelSlider
              value={color.hslv.lightness}
              onChange={(e) => channelChanged("hslv", "lightness", e)}
              label={"L"}
              min={0}
              max={100}
              step={2}
            />
          </>
        );
      case ColorSelectorPage.Hsv:
        return (
          <>
            <ChannelSlider
              value={color.hslv.hue}
              onChange={(e) => channelChanged("hslv", "hueV", e)}
              label={"H"}
              min={0}
              max={360}
              step={5}
            />
            <ChannelSlider
              value={color.hslv.saturationV}
              onChange={(e) => channelChanged("hslv", "saturationV", e)}
              label={"S"}
              min={0}
              max={100}
              step={2}
            />
            <ChannelSlider
              value={color.hslv.value}
              onChange={(e) => channelChanged("hslv", "value", e)}
              label={"V"}
              min={0}
              max={100}
              step={2}
            />
          </>
        );
      case ColorSelectorPage.Lch:
        return (
          <>
            <ChannelSlider
              value={color.labch.lightness}
              onChange={(e) => channelChanged("labch", "lightnessLch", e)}
              label={"L"}
              min={0}
              max={100}
              step={2}
            />
            <ChannelSlider
              value={color.labch.chroma}
              onChange={(e) => channelChanged("labch", "chroma", e)}
              label={"C"}
              min={0}
              max={150}
              step={3}
            />
            <ChannelSlider
              value={color.labch.hue}
              onChange={(e) => channelChanged("labch", "hue", e)}
              label={"H"}
              min={0}
              max={360}
              step={5}
            />
          </>
        );
      case ColorSelectorPage.Lab:
        return (
          <>
            <ChannelSlider
              value={color.labch.lightness}
              onChange={(e) => channelChanged("labch", "lightnessLab", e)}
              label={"L"}
              min={0}
              max={100}
              step={2}
            />
            <ChannelSlider
              value={color.labch.a}
              onChange={(e) => channelChanged("labch", "a", e)}
              label={"A"}
              min={-125}
              max={125}
              step={5}
            />
            <ChannelSlider
              value={color.labch.b}
              onChange={(e) => channelChanged("labch", "b", e)}
              label={"B"}
              min={-125}
              max={125}
              step={5}
            />
          </>
        );
      case ColorSelectorPage.Oklch:
        return (
          <>
            <ChannelSlider
              value={color.oklabch.lightness}
              onChange={(e) => channelChanged("oklabch", "lightnessLch", e)}
              label={"L"}
              min={0}
              max={100}
              step={2}
            />
            <ChannelSlider
              value={color.oklabch.chroma}
              onChange={(e) => channelChanged("oklabch", "chroma", e)}
              label={"C"}
              min={0}
              max={40}
              step={1}
            />
            <ChannelSlider
              value={color.oklabch.hue}
              onChange={(e) => channelChanged("oklabch", "hue", e)}
              label={"H"}
              min={0}
              max={360}
              step={5}
            />
          </>
        );
      case ColorSelectorPage.Oklab:
        return (
          <>
            <ChannelSlider
              value={color.oklabch.lightness}
              onChange={(e) => channelChanged("oklabch", "lightnessLab", e)}
              label={"L"}
              min={0}
              max={100}
              step={2}
            />
            <ChannelSlider
              value={color.oklabch.a}
              onChange={(e) => channelChanged("oklabch", "a", e)}
              label={"A"}
              min={-40}
              max={40}
              step={2}
            />
            <ChannelSlider
              value={color.oklabch.b}
              onChange={(e) => channelChanged("oklabch", "b", e)}
              label={"B"}
              min={-40}
              max={40}
              step={2}
            />
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
          <div>
            <ChannelSlider
              value={color.rgb.red}
              onChange={(e) => channelChanged("rgb", "red", e)}
              label={"R"}
              min={0}
              max={255}
              step={5}
            />
            <ChannelSlider
              value={color.rgb.green}
              onChange={(e) => channelChanged("rgb", "green", e)}
              label={"G"}
              min={0}
              max={255}
              step={5}
            />
            <ChannelSlider
              value={color.rgb.blue}
              onChange={(e) => channelChanged("rgb", "blue", e)}
              label={"B"}
              min={0}
              max={255}
              step={5}
            />
          </div>
          <div>
            <div className="tabbar">
              {pageRadioButton(ColorSelectorPage.Hsl)}
              {pageRadioButton(ColorSelectorPage.Hsv)}
              {pageRadioButton(ColorSelectorPage.Lch)}
              {pageRadioButton(ColorSelectorPage.Lab)}
              {pageRadioButton(ColorSelectorPage.Oklch)}
              {pageRadioButton(ColorSelectorPage.Oklab)}
            </div>
            {pageSliders()}
          </div>
        </div>
        <div className="color-preview-column">
          <div className="color-preview" style={{ backgroundColor: color.rgb.hex }} />
          <div className="color-hex">
            <HexInput color={color} onColorChange={onColorChange} />
          </div>
        </div>
      </div>
    </>
  );
}
