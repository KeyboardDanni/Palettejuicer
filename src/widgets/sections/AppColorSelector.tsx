import { useContext, useEffect, useState } from "react";

import { Color } from "../../model/color/Color";
import { Palette } from "../../model/Palette";
import { CelIndex } from "../../util/cel";
import { ColorSelector } from "./ColorSelector";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";
import { AppStateContext } from "../../contexts/AppStateContext";

type AppColorSelectorProps = {
  palette: Palette;
  activeColorIndex: CelIndex;
  onPaletteChange: React.Dispatch<PaletteAction>;
};
export function AppColorSelector(props: AppColorSelectorProps) {
  const [showBase, setShowBase] = useState(false);
  const appState = useContext(AppStateContext);

  const hasComputed = props.palette.isComputed(props.activeColorIndex);

  useEffect(
    function () {
      if (appState.options.autoDeselectEditBase && !hasComputed && showBase) {
        setShowBase(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally avoiding updates on showBase change
    [appState.options, setShowBase, props.activeColorIndex]
  );

  function handleColorChange(color: Color) {
    props.onPaletteChange(
      new PaletteAction({
        actionType: PaletteActionType.SetBaseColor,
        args: { index: props.activeColorIndex, color },
      })
    );
  }

  function handleShowBaseClick() {
    setShowBase(!showBase);
  }

  const computed = hasComputed && !showBase;
  const colorTypeName = computed ? "Computed" : "Base Color";

  const color = computed
    ? props.palette.color(props.activeColorIndex)
    : props.palette.baseColor(props.activeColorIndex);

  return (
    <>
      <div id="sidebar-color-selector" className="section">
        <div className="header-bar">
          <span className="section-header">Color</span>
          <span className="section-subheader">∙</span>
          <span className="section-subheader">
            {colorTypeName} [{props.activeColorIndex.x}, {props.activeColorIndex.y}]
          </span>
          <div className="header-bar-spacer" />
          {hasComputed && (
            <label>
              <input type="checkbox" checked={showBase} onChange={handleShowBaseClick} />
              Edit Base
            </label>
          )}
        </div>
        <ColorSelector color={color} onColorChange={handleColorChange} computed={computed} />
      </div>
    </>
  );
}
