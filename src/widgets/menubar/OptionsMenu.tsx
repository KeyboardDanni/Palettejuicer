import { useCallback, useContext, useRef } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import { DropdownMenuButton } from "../common/DropdownButton";
import { PopupMenuItem, PopupMenuSeparatorItem } from "../common/PopupMenu";
import { AppOptions } from "../../model/AppOptions";
import { AppStateContext, AppStateSetterContext } from "../../contexts/AppStateContext";

export function OptionsMenu() {
  const popupRef = useRef<PopupActions>(null);
  const appState = useContext(AppStateContext);
  const setAppState = useContext(AppStateSetterContext);

  const handleToggleChecked = useCallback(
    function (property: string) {
      popupRef?.current?.close();
      setAppState((draft) => {
        draft.options[property as keyof AppOptions] = !draft.options[property as keyof AppOptions];
      });
    },
    [popupRef, setAppState]
  );

  return (
    <>
      <DropdownMenuButton popupRef={popupRef} label="Options">
        <PopupMenuItem
          key={0}
          index={0}
          name="Show Palette Ruler"
          description="Display coordinates on the sides of the palette grid."
          checked={appState.options.paletteRuler}
          onItemSelect={() => handleToggleChecked("paletteRuler")}
        />
        <PopupMenuSeparatorItem />
        <PopupMenuItem
          key={1}
          index={1}
          name={'Auto-Deselect "Edit Base"'}
          description={'Uncheck "Edit Base" when selecting a different color.'}
          checked={appState.options.autoDeselectEditBase}
          onItemSelect={() => handleToggleChecked("autoDeselectEditBase")}
        />
      </DropdownMenuButton>
    </>
  );
}
