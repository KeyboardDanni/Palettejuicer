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

  const unwrappedLicense = licenseString.replace(/(.)\n(?!\n)/g, " ");

  return (
    <>
      <Popup open={props.popupOpen} onClose={closePopup} nested={true} className="modal-popup">
        <div id="tutorial" className="modal-popup scroll-area-with-recess">
          <div className="modal-popup-header modal-popup-header-spaced">
            <div className="logo" title="Palettejuicer" />
          </div>
          <OverlayScrollbarsComponent options={{ scrollbars: { theme: "raised-scrollbar" } }}>
            <div className="tutorial-page">
              <p>
                Palettejuicer was created by{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/KeyboardDanni">
                  Danni
                </a>
                , and is provided under the ISC License:
              </p>
              <code className="code-block">{unwrappedLicense}</code>
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
