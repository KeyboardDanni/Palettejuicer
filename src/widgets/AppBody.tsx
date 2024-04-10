import { useState } from "react";

import { Color } from "../model/color/Color";
import { Palette } from "../model/Palette";
import { ColorSelector } from "./ColorSelector";
import { PaletteView } from "./PaletteView";

export function AppBody() {
  const [activeColorIndex, setActiveColorIndex] = useState({ x: 0, y: 0 });
  const [palette, setPalette] = useState(new Palette());

  function handleColorChange(color: Color) {
    const newPalette = palette.setSelectedColor(activeColorIndex.x, activeColorIndex.y, color);

    setPalette(newPalette);
  }

  return (
    <>
      <div id="app-body">
        <div id="app-columns">
          <div id="document-sidebar">
            <div id="sidebar-color-selector" className="section">
              <span className="section-header">
                Selected Color ({activeColorIndex.x}, {activeColorIndex.y})
              </span>
              <ColorSelector
                color={palette.selectedColor(activeColorIndex.x, activeColorIndex.y)}
                onColorChange={handleColorChange}
              />
            </div>
            <div id="sidebar-calculations" className="section">
              <div className="header-bar">
                <span className="section-header">Calculations</span>
                <div className="button-bar-spacer" />
                <label>
                  <input type="checkbox" />
                  Enabled
                </label>
              </div>
              <div className="button-bar">
                <button>Add</button>
                <button>Duplicate</button>
                <button>Remove</button>
              </div>
              <div className="placeholder">
                No calculations defined. Click 'Add' to start generating new shades of colors.
              </div>
            </div>
            <div id="sidebar-properties" className="section">
              <span className="section-header">Properties</span>
              <div className="placeholder">Select a calculation to adjust its properties.</div>
            </div>
          </div>
          <div id="document-palette" className="section">
            <span className="section-header">Palette</span>
            <div id="palette-inner-bg" className="section-gray-background">
              <PaletteView
                palette={palette}
                index={activeColorIndex}
                onIndexClicked={(x, y) => setActiveColorIndex({ x, y })}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
