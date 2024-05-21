import { ChangeEvent, useCallback } from "react";

import { Palette } from "../../model/Palette";
import { CelIndex } from "../../util/cel";
import { PaletteView } from "./PaletteView";
import { PaletteAction, PaletteActionType } from "../../reducers/PaletteReducer";

type AppPaletteProps = {
  palette: Palette;
  onPaletteChange: React.Dispatch<PaletteAction>;
  activeColorIndex: CelIndex;
  onIndexChange: (index: CelIndex) => void;
};
export function AppPalette(props: AppPaletteProps) {
  const onIndexChange = props.onIndexChange;
  const onPaletteChange = props.onPaletteChange;
  const handleClick = useCallback(
    function (index: CelIndex) {
      onIndexChange(index);
    },
    [onIndexChange]
  );

  const handleNameChange = useCallback(
    function (event: ChangeEvent<HTMLInputElement>) {
      onPaletteChange(
        new PaletteAction({
          actionType: PaletteActionType.RenamePalette,
          args: { paletteName: event.target.value },
        })
      );
    },
    [onPaletteChange]
  );

  return (
    <>
      <div id="document-palette" className="section">
        <input
          className="palette-rename flat-text"
          type="text"
          value={props.palette.paletteName}
          onChange={handleNameChange}
          placeholder={"Untitled Palette"}
        />
        <div id="palette-inner-bg" className="section-gray-background">
          <PaletteView
            palette={props.palette}
            onPaletteChange={props.onPaletteChange}
            active={props.activeColorIndex}
            onIndexChange={handleClick}
            autoFocus={true}
          />
        </div>
      </div>
    </>
  );
}
