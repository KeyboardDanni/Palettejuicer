import { ChangeEvent, useState } from "react";
import { castDraft, produce } from "immer";

import { Color } from "../../model/color/Color";
import { ChannelInfo, ChannelType, Colorspace } from "../../model/color/Colorspace";
import { ControlledTextInput } from "./ControlledTextInput";
import { NumberSlider } from "./NumberSlider";
import { ColorspaceRgb } from "../../model/color/ColorspaceRgb";
import { PageTab } from "./PageTab";
import { DropdownChoiceButton } from "./DropdownButton";
import { PopupMenuChoiceData } from "./PopupMenu";

enum ColorSelectorPage {
  Oklch = "OkLCH",
  Oklab = "OkLAB",
  Okhsl = "OkHSL",
  Okhsv = "OkHSV",
  Lch = "LCH",
  Lab = "LAB",
  Hsl = "HSL",
  Hsv = "HSV",
}

const colorSelectorDropdownItems: PopupMenuChoiceData[] = [
  {
    name: "OkLCH",
    description: "A newer variant of LCH. Like OkLAB, but easier to select colors from. Can go outside the sRGB gamut.",
  },
  {
    name: "OkLAB",
    description: "A newer variant of LAB with more evenly distributed results. Can go outside the sRGB gamut.",
  },
  {
    name: "OkHSL",
    description: "A newer variant of HSL. Has more even perceptual lighting, but stays within the sRGB gamut.",
  },
  {
    name: "OkHSV",
    description: "A newer variant of HSV. Has more even perceptual lighting, but stays within the sRGB gamut.",
  },
  {
    name: "LCH",
    description:
      "A classic space that aims for even perceptual lighting. Like LAB, but easier to select colors from. Can go outside the sRGB gamut.",
  },
  {
    name: "LAB",
    description: "A classic space that aims for even perceptual lighting. Can go outside the sRGB gamut.",
  },
  {
    name: "HSL",
    description:
      "An established space that makes it easy to select colors, but is inconsistent, and has very uneven perceptual lighting.",
  },
  {
    name: "HSV",
    description:
      "An established space that makes it easy to select colors, but is inconsistent, and has very uneven perceptual lighting.",
  },
];

type ChannelSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  label: string;
  min: number;
  max: number;
  step: number;
  allowNone?: boolean;
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
          allowNone={props.allowNone}
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
        allowNone={channel.channelType === ChannelType.IsHue}
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
    case ColorSelectorPage.Okhsl:
      colorspace = "okhsl";
      break;
    case ColorSelectorPage.Okhsv:
      colorspace = "okhsv";
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

export type PageTabsProps = {
  page: string;
  onPageChange: (value: string) => void;
};

function PageTabs(props: PageTabsProps) {
  const [spaces, setSpaces] = useState<ColorSelectorPage[]>([]);
  let currentSpaces = spaces;
  const tabs = [];

  if (!(currentSpaces as string[]).includes(props.page)) {
    switch (props.page) {
      case ColorSelectorPage.Oklch:
      case ColorSelectorPage.Oklab:
      case ColorSelectorPage.Okhsl:
      case ColorSelectorPage.Okhsv:
        currentSpaces = [
          ColorSelectorPage.Oklch,
          ColorSelectorPage.Oklab,
          ColorSelectorPage.Okhsl,
          ColorSelectorPage.Okhsv,
        ];
        break;
      case ColorSelectorPage.Lch:
      case ColorSelectorPage.Lab:
        currentSpaces = [
          ColorSelectorPage.Oklch,
          ColorSelectorPage.Oklab,
          ColorSelectorPage.Lch,
          ColorSelectorPage.Lab,
        ];
        break;
      case ColorSelectorPage.Hsl:
      case ColorSelectorPage.Hsv:
        currentSpaces = [
          ColorSelectorPage.Okhsl,
          ColorSelectorPage.Okhsv,
          ColorSelectorPage.Hsl,
          ColorSelectorPage.Hsv,
        ];
        break;
    }

    setSpaces(currentSpaces);
  }

  for (const space of currentSpaces) {
    tabs.push(<PageTab key={space} pageName={space} onPageChange={props.onPageChange} activePage={props.page} />);
  }

  return <>{tabs}</>;
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

  function setPageByIndex(index: number) {
    setPage(colorSelectorDropdownItems[index].name);
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
              <PageTabs page={page} onPageChange={setPage} />
              <div className="tabbar-spacer" />
              <DropdownChoiceButton
                className="thin-button"
                label="More"
                items={colorSelectorDropdownItems}
                onItemSelect={setPageByIndex}
              />
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
