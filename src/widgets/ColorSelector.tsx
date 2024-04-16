import { ChangeEvent, useState } from "react";

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
  onChange: (value: number) => void;
  disabled: boolean;
  label: string;
  min: number;
  max: number;
  step: number;
};

const GAMUT_ROUNDING_ERROR = 0.0001;

function ChannelSlider(props: ChannelSliderProps) {
  const displayValue = props.step >= 1 ? (Math.round(props.value * 10) / 10).toString() : props.value.toString();
  const className =
    props.value + GAMUT_ROUNDING_ERROR < props.min || props.value - GAMUT_ROUNDING_ERROR > props.max
      ? "out-of-gamut"
      : "";

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
          displayValue={displayValue}
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

export type ColorSelectorProps = {
  color: Color;
  computed: boolean;
  onColorChange: (color: Color) => void;
};

export function ColorSelector(props: ColorSelectorProps) {
  const [page, setPage] = useState<string>(ColorSelectorPage.Hsl);

  function tryColorChange(color: Color) {
    if (!props.computed) {
      props.onColorChange(color);
    }
  }

  function handlePageChange(event: ChangeEvent<HTMLInputElement>) {
    setPage(event.target.value);
  }

  function pageRadioButton(pageName: ColorSelectorPage) {
    return (
      <>
        <label className="tabbar-tab">
          <input
            type="radio"
            name="colorspace"
            value={pageName}
            onChange={handlePageChange}
            checked={page === pageName}
          />
          <span>{pageName}</span>
        </label>
      </>
    );
  }

  function handleChannelChange(colorspace: string, channel: string, value: number) {
    if (value !== props.color.channel(colorspace, channel)) {
      tryColorChange(props.color.adjustChannel(colorspace, channel, value));
    }
  }

  function pageSliders() {
    switch (page) {
      case ColorSelectorPage.Hsl:
        return (
          <>
            <ChannelSlider
              value={props.color.hslv.hue}
              onChange={(value) => handleChannelChange("hslv", "hueL", value)}
              label={"H"}
              min={0}
              max={360}
              step={5}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.hslv.saturationL}
              onChange={(value) => handleChannelChange("hslv", "saturationL", value)}
              label={"S"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.hslv.lightness}
              onChange={(value) => handleChannelChange("hslv", "lightness", value)}
              label={"L"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
          </>
        );
      case ColorSelectorPage.Hsv:
        return (
          <>
            <ChannelSlider
              value={props.color.hslv.hue}
              onChange={(value) => handleChannelChange("hslv", "hueV", value)}
              label={"H"}
              min={0}
              max={360}
              step={5}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.hslv.saturationV}
              onChange={(value) => handleChannelChange("hslv", "saturationV", value)}
              label={"S"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.hslv.value}
              onChange={(value) => handleChannelChange("hslv", "value", value)}
              label={"V"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
          </>
        );
      case ColorSelectorPage.Lch:
        return (
          <>
            <ChannelSlider
              value={props.color.labch.lightness}
              onChange={(value) => handleChannelChange("labch", "lightnessLch", value)}
              label={"L"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.labch.chroma}
              onChange={(value) => handleChannelChange("labch", "chroma", value)}
              label={"C"}
              min={0}
              max={150}
              step={3}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.labch.hue}
              onChange={(value) => handleChannelChange("labch", "hue", value)}
              label={"H"}
              min={0}
              max={360}
              step={5}
              disabled={props.computed}
            />
          </>
        );
      case ColorSelectorPage.Lab:
        return (
          <>
            <ChannelSlider
              value={props.color.labch.lightness}
              onChange={(value) => handleChannelChange("labch", "lightnessLab", value)}
              label={"L"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.labch.a}
              onChange={(value) => handleChannelChange("labch", "a", value)}
              label={"A"}
              min={-125}
              max={125}
              step={5}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.labch.b}
              onChange={(value) => handleChannelChange("labch", "b", value)}
              label={"B"}
              min={-125}
              max={125}
              step={5}
              disabled={props.computed}
            />
          </>
        );
      case ColorSelectorPage.Oklch:
        return (
          <>
            <ChannelSlider
              value={props.color.oklabch.lightness}
              onChange={(value) => handleChannelChange("oklabch", "lightnessLch", value)}
              label={"L"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.oklabch.chroma}
              onChange={(value) => handleChannelChange("oklabch", "chroma", value)}
              label={"C"}
              min={0}
              max={40}
              step={1}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.oklabch.hue}
              onChange={(value) => handleChannelChange("oklabch", "hue", value)}
              label={"H"}
              min={0}
              max={360}
              step={5}
              disabled={props.computed}
            />
          </>
        );
      case ColorSelectorPage.Oklab:
        return (
          <>
            <ChannelSlider
              value={props.color.oklabch.lightness}
              onChange={(value) => handleChannelChange("oklabch", "lightnessLab", value)}
              label={"L"}
              min={0}
              max={100}
              step={2}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.oklabch.a}
              onChange={(value) => handleChannelChange("oklabch", "a", value)}
              label={"A"}
              min={-40}
              max={40}
              step={2}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.oklabch.b}
              onChange={(value) => handleChannelChange("oklabch", "b", value)}
              label={"B"}
              min={-40}
              max={40}
              step={2}
              disabled={props.computed}
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
              value={props.color.rgb.red}
              onChange={(value) => handleChannelChange("rgb", "red", value)}
              label={"R"}
              min={0}
              max={255}
              step={5}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.rgb.green}
              onChange={(value) => handleChannelChange("rgb", "green", value)}
              label={"G"}
              min={0}
              max={255}
              step={5}
              disabled={props.computed}
            />
            <ChannelSlider
              value={props.color.rgb.blue}
              onChange={(value) => handleChannelChange("rgb", "blue", value)}
              label={"B"}
              min={0}
              max={255}
              step={5}
              disabled={props.computed}
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
          <div className="color-preview" style={{ backgroundColor: props.color.rgb.hex }} />
          <div className="color-hex">
            <HexInput color={props.color} onColorChange={tryColorChange} disabled={props.computed} />
          </div>
        </div>
      </div>
    </>
  );
}
