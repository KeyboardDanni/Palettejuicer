import { useCallback, useRef, useState } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import { DropdownButton } from "../common/DropdownButton";
import { PopupMenuItem, PopupMenuSeparatorItem } from "../common/PopupMenu";
import { Credits } from "../Credits";

const PROJECT_URL = "https://github.com/KeyboardDanni/palettejuicer";

export function AboutMenu() {
  const popupRef = useRef<PopupActions>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);

  const handleSource = useCallback(
    function () {
      popupRef?.current?.close();
      window.open(PROJECT_URL, "_blank", "noopener,noreferrer");
    },
    [popupRef]
  );

  const handleCredits = useCallback(
    function () {
      popupRef?.current?.close();
      setCreditsOpen(true);
    },
    [setCreditsOpen]
  );

  return (
    <>
      <DropdownButton popupRef={popupRef} label="About">
        <PopupMenuItem
          key={0}
          index={0}
          name="View on GitHub"
          description="View source code on GitHub."
          onItemSelect={handleSource}
        />
        <PopupMenuSeparatorItem />
        <PopupMenuItem key={1} index={1} name="Credits" onItemSelect={handleCredits} />
      </DropdownButton>
      <Credits popupOpen={creditsOpen} setPopupOpen={setCreditsOpen} />
    </>
  );
}
