import { useCallback, useContext, useRef } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import { DropdownButton } from "../common/DropdownButton";
import { PopupMenuItem, PopupMenuSeparatorItem } from "../common/PopupMenu";
import { AppOptions } from "../../model/AppOptions";
import { AppOptionsContext, AppOptionsSetterContext } from "../../contexts/AppOptionsContext";

export function OptionsMenu() {
  const popupRef = useRef<PopupActions>(null);
  const appOptions = useContext(AppOptionsContext);
  const setAppOptions = useContext(AppOptionsSetterContext);

  const handleToggleChecked = useCallback(
    function (property: string) {
      popupRef?.current?.close();
      setAppOptions((draft) => {
        draft[property as keyof AppOptions] = !draft[property as keyof AppOptions];
      });
    },
    [popupRef, setAppOptions]
  );

  return (
    <>
      <DropdownButton popupRef={popupRef} label="Options">
        <PopupMenuItem
          key={0}
          index={0}
          name="Show Palette Ruler"
          description="Display coordinates on the sides of the palette grid."
          checked={appOptions.paletteRuler}
          onItemSelect={() => handleToggleChecked("paletteRuler")}
        />
        <PopupMenuSeparatorItem />
        <PopupMenuItem
          key={1}
          index={1}
          name={'Auto-Deselect "Edit Base"'}
          description={'Uncheck "Edit Base" when selecting a different color.'}
          checked={appOptions.autoDeselectEditBase}
          onItemSelect={() => handleToggleChecked("autoDeselectEditBase")}
        />
      </DropdownButton>
    </>
  );
}
