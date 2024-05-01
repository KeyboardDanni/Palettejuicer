import { useCallback, useRef, useState } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import Popup from "reactjs-popup";

import { DropdownButton } from "./common/DropdownButton";
import { ProjectAction, ProjectFileAction, ProjectFileActionType } from "../reducers/ProjectReducer";
import { FilePicker } from "../storage/FilePicker";
import { Project } from "../model/Project";
import { PopupMenuItem, PopupMenuSeparatorItem } from "./common/PopupMenu";
import { HistoryAction, HistoryActionType } from "../reducers/HistoryReducer";
import { UndoHistory } from "../model/UndoHistory";
import { Tutorial } from "./tutorial/Tutorial";

type ConfirmPopupProps = {
  confirmOpen: boolean;
  setConfirmOpen: (value: boolean) => void;
  onConfirm: () => void;
};

function ConfirmPopup(props: ConfirmPopupProps) {
  const acceptConfirm = useCallback(
    function () {
      props.setConfirmOpen(false);
      props.onConfirm();
    },
    [props]
  );

  const closeConfirm = useCallback(
    function () {
      props.setConfirmOpen(false);
    },
    [props]
  );

  return (
    <>
      <Popup open={props.confirmOpen} onClose={closeConfirm} className="modal-popup">
        <div className="section popup-message-content">
          <div className="popup-header">Are you sure?</div>
          <p>Do you really want to clear your project and start over?</p>
          <div className="button-bar">
            <button className="danger" onClick={acceptConfirm}>
              Yes, I'm sure
            </button>
            <button onClick={closeConfirm}>Nope, that was an accident</button>
          </div>
        </div>
      </Popup>
    </>
  );
}

export type FileMenuProps = {
  project: Project;
  onProjectChange: React.Dispatch<ProjectAction>;
};

export function FileMenu(props: FileMenuProps) {
  const popupRef = useRef<PopupActions>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClear = useCallback(
    function () {
      popupRef?.current?.close();
      setConfirmOpen(true);
    },
    [popupRef, setConfirmOpen]
  );

  const handleReallyClear = useCallback(
    function () {
      props.onProjectChange(new ProjectFileAction({ actionType: ProjectFileActionType.Clear }));
      setConfirmOpen(false);
    },
    [props, setConfirmOpen]
  );

  const handleLoad = useCallback(
    async function () {
      popupRef?.current?.close();

      const project = await FilePicker.load(Project);
      props.onProjectChange(new ProjectFileAction({ actionType: ProjectFileActionType.Set, args: { project } }));
    },
    [props]
  );

  const handleSave = useCallback(
    async function () {
      popupRef?.current?.close();
      await FilePicker.save(props.project);
    },
    [props]
  );

  return (
    <>
      <DropdownButton popupRef={popupRef} label="File">
        <PopupMenuItem
          key={0}
          index={0}
          name="Clear"
          description="Start over with a new project."
          onItemSelect={handleClear}
        />
        <PopupMenuSeparatorItem key="separator 1" />
        <PopupMenuItem
          key={1}
          index={1}
          name="Load from JSON"
          description="Load a Palettejuicer project from JSON stored on your local drive."
          onItemSelect={handleLoad}
        />
        <PopupMenuItem
          key={2}
          index={2}
          name="Save to JSON"
          description="Save a Palettejuicer project to JSON stored on your local drive."
          onItemSelect={handleSave}
        />
      </DropdownButton>
      <ConfirmPopup confirmOpen={confirmOpen} setConfirmOpen={setConfirmOpen} onConfirm={handleReallyClear} />
    </>
  );
}

export type AppHeaderProps = {
  history: UndoHistory<Project>;
  onHistoryChange: React.Dispatch<HistoryAction | ProjectAction>;
};

export function AppHeader(props: AppHeaderProps) {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const onHistoryChange = props.onHistoryChange;

  const handleUndo = useCallback(
    function () {
      onHistoryChange(new HistoryAction({ actionType: HistoryActionType.Undo }));
    },
    [onHistoryChange]
  );

  const handleRedo = useCallback(
    function () {
      onHistoryChange(new HistoryAction({ actionType: HistoryActionType.Redo }));
    },
    [onHistoryChange]
  );

  const handleTutorial = useCallback(
    function () {
      setTutorialOpen(true);
    },
    [setTutorialOpen]
  );

  return (
    <>
      <div id="app-header">
        <div className="logo" />
        <div id="menubar">
          <FileMenu project={props.history.current()} onProjectChange={props.onHistoryChange} />
          <div id="undo-redo-group">
            <button onClick={handleUndo}>Undo</button>
            <button onClick={handleRedo}>Redo</button>
          </div>
          <button onClick={handleTutorial}>Tutorial</button>
        </div>
      </div>
      <Tutorial popupOpen={tutorialOpen} setPopupOpen={setTutorialOpen} />
    </>
  );
}
