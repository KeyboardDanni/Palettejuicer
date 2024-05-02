import { useCallback, useState } from "react";
import Popup from "reactjs-popup";

import { PageTab } from "../common/PageTab";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { WhyPalettejuicerPage } from "./WhyPalettejuicerPage";
import { SelectingColorsPage } from "./SelectingColorsPage";
import { GeneratingColorsPage } from "./GeneratingColorsPage";
import { OutOfGamutPage } from "./OutOfGamutPage";
import { SavingWorkPage } from "./SavingWorkPage";

enum TutorialPage {
  WhyPalettejuicer = "Why Palettejuicer?",
  SelectingColors = "Selecting Colors",
  GeneratingColors = "Generating Colors",
  OutOfGamut = "Keeping Colors in-Gamut",
  SavingWork = "Saving Your Work",
}

type TutorialPageViewProps = {
  page: string;
};

function TutorialPageView(props: TutorialPageViewProps) {
  switch (props.page) {
    case TutorialPage.WhyPalettejuicer:
      return <WhyPalettejuicerPage />;
    case TutorialPage.SelectingColors:
      return <SelectingColorsPage />;
    case TutorialPage.GeneratingColors:
      return <GeneratingColorsPage />;
    case TutorialPage.OutOfGamut:
      return <OutOfGamutPage />;
    case TutorialPage.SavingWork:
      return <SavingWorkPage />;
    default:
      throw new Error("Bad enum");
  }
}

type TutorialProps = {
  popupOpen: boolean;
  setPopupOpen: (value: boolean) => void;
};

export function Tutorial(props: TutorialProps) {
  const [page, setPage] = useState<string>(TutorialPage.WhyPalettejuicer);

  const closePopup = useCallback(
    function () {
      props.setPopupOpen(false);
    },
    [props]
  );

  return (
    <>
      <Popup open={props.popupOpen} onClose={closePopup} className="modal-popup">
        <div id="tutorial" className="section">
          <h1>Palettejuicer Tutorial</h1>
          <div className="tabbar">
            <PageTab pageName={TutorialPage.WhyPalettejuicer} onPageChange={setPage} activePage={page} />
            <PageTab pageName={TutorialPage.SelectingColors} onPageChange={setPage} activePage={page} />
            <PageTab pageName={TutorialPage.GeneratingColors} onPageChange={setPage} activePage={page} />
            <PageTab pageName={TutorialPage.OutOfGamut} onPageChange={setPage} activePage={page} />
            <PageTab pageName={TutorialPage.SavingWork} onPageChange={setPage} activePage={page} />
          </div>
          <div className="tutorial-scroll" key={page}>
            <OverlayScrollbarsComponent options={{ scrollbars: { theme: "raised-scrollbar" } }}>
              <TutorialPageView page={page} />
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </Popup>
    </>
  );
}
