import { ChangeEvent, ChangeEventHandler, useState } from "react";
import Color, { Channel } from "../model/Color";

enum ColorSelectorPage {
  HSL = "HSL",
  HSV = "HSV"
}

function backgroundColorStyle(color: Color) {
  return {
    backgroundColor: `rgb(${color.red} ${color.green} ${color.blue})`
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
  const [temp, setTemp] = useState<string>(value.toString());
  const [tempActive, setTempActive] = useState(false);

  function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    setTemp(value.toString());
    setTempActive(true);
    event.target.select();
  }

  function handleBlur() {
    setTempActive(false);
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event);
    setTemp(event.target.value);
  }

  const editValue = tempActive ? temp : value;

  return (
  <>
    <div className="color-slider">
      <span className="label-left">{label}</span>
      <input type="range" value={value} onChange={onChange} min={min} max={max} step={step} />
      <input type="text" inputMode="decimal" value={editValue} onFocus={handleFocus}
        onBlur={handleBlur} onChange={handleTextChange} />
    </div>
  </>
  )
}

type ColorSelectorProps = {
  color: Color;
  colorChanged: (color: Color) => void;
};

function ColorSelector({color, colorChanged}: ColorSelectorProps) {
  const [page, setPage] = useState<string>(ColorSelectorPage.HSL);

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

  function channelChanged(channel: Channel, event: ChangeEvent<HTMLInputElement>) {
    const newValue = parseFloat(event.target.value) || 0;

    if (newValue !== color.channel(channel)) {
      colorChanged(color.adjust(channel, newValue));
    }
  }

  function pageSliders() {
    switch (page) {
      case ColorSelectorPage.HSL:
        return (
          <>
            <ChannelSlider value={color.hue} onChange={(e) => channelChanged(Channel.HueL, e)}
              label={"H"} min={0} max={360} step={5} />
            <ChannelSlider value={color.saturationL} onChange={(e) => channelChanged(Channel.SaturationL, e)}
              label={"S"} min={0} max={1} step={0.02} />
            <ChannelSlider value={color.lightness} onChange={(e) => channelChanged(Channel.Lightness, e)}
              label={"L"} min={0} max={1} step={0.02} />
          </>
        );
      case ColorSelectorPage.HSV:
        return (
          <>
            <ChannelSlider value={color.hue} onChange={(e) => channelChanged(Channel.HueV, e)}
              label={"H"} min={0} max={360} step={5} />
            <ChannelSlider value={color.saturationV} onChange={(e) => channelChanged(Channel.SaturationV, e)}
              label={"S"} min={0} max={1} step={0.02} />
            <ChannelSlider value={color.value} onChange={(e) => channelChanged(Channel.Value, e)}
              label={"V"} min={0} max={1} step={0.02} />
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
            <ChannelSlider value={color.red} onChange={(e) => channelChanged(Channel.Red, e)}
              label={"R"} min={0} max={255} step={5} />
            <ChannelSlider value={color.green} onChange={(e) => channelChanged(Channel.Green, e)}
              label={"G"} min={0} max={255} step={5} />
            <ChannelSlider value={color.blue} onChange={(e) => channelChanged(Channel.Blue, e)}
              label={"B"} min={0} max={255} step={5} />
          </div>
          <div className="subsection">
            <div className="subsection-header">
              <div className="tabbar">
                {pageRadioButton(ColorSelectorPage.HSL)}
                {pageRadioButton(ColorSelectorPage.HSV)}
              </div>
            </div>
            {pageSliders()}
          </div>
        </div>
        <div className="color-preview " style={backgroundColorStyle(color)} />
      </div>
    </>
  )
}

export default ColorSelector;
