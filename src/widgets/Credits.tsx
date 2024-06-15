import { useCallback } from "react";
import Popup from "reactjs-popup";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import licenseString from "../../LICENSE?raw";

type CreditsProps = {
  popupOpen: boolean;
  setPopupOpen: (value: boolean) => void;
};

export function Credits(props: CreditsProps) {
  const closePopup = useCallback(
    function () {
      props.setPopupOpen(false);
    },
    [props]
  );

  const licenseLines = licenseString.split("\n\n");
  const licenseParagraphs = licenseLines.map((line, i) => <p key={i}>{line}</p>);

  return (
    <>
      <Popup open={props.popupOpen} onClose={closePopup} nested={true} className="modal-popup">
        <div id="tutorial" className="section scroll-area-with-recess">
          <OverlayScrollbarsComponent options={{ scrollbars: { theme: "raised-scrollbar" } }}>
            <div className="tutorial-page">
              <div className="logo" title="Palettejuicer" />
              <p>
                Palettejuicer was created by{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/KeyboardDanni">
                  Danni
                </a>
                .
              </p>
              {licenseParagraphs}
              <p>
                This app was made possible by{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://react.dev/">
                  React
                </a>
                ,{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://vitejs.dev/">
                  Vite
                </a>
                , and{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://colorjs.io/">
                  Color.js
                </a>
                .
              </p>
              <p>
                Uses icons from{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://fontawesome.com/">
                  Font Awesome Free 6
                </a>
                .
              </p>
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </Popup>
    </>
  );
}
