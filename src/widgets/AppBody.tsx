import { useState } from "react";

import Color from "../model/color/Color";
import ColorSelector from "./ColorSelector";
import Palette from "./Palette";

function AppBody() {
  const [color, setColor] = useState(new Color());

  return (
    <>
      <div id="app-body">
        <div id="app-columns">
          <div id="document-sidebar">
            <div id="sidebar-color-selector" className="section">
              <span className="section-header">Selected Color</span>
              <ColorSelector color={color} onColorChange={(color) => setColor(color)} />
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
              <Palette />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AppBody;
