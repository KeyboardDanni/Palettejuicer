import { useCallback, useRef, useState } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import Popup from "reactjs-popup";

import { DropdownButton } from "./common/DropdownButton";
import { ProjectAction, ProjectFileAction, ProjectFileActionType } from "../reducers/ProjectReducer";
import { Project } from "../model/Project";
import { ProjectFile } from "../storage/ProjectFile";
import { PopupMenuItem, PopupMenuSeparatorItem } from "./common/PopupMenu";
import { HistoryAction, HistoryActionType } from "../reducers/HistoryReducer";
import { UndoHistory } from "../model/UndoHistory";
import { Tutorial } from "./tutorial/Tutorial";

import { Exporter } from "../storage/exporters/Exporter";
import { GnuPaletteExporter } from "../storage/exporters/GnuPaletteExporter";
import { JascPalExporter } from "../storage/exporters/JascPalExporter";
import { Credits } from "./Credits";

const PROJECT_URL = "https://github.com/KeyboardDanni/palettejuicer";

const availableExporters: (typeof Exporter)[] = [GnuPaletteExporter, JascPalExporter];

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

      const project = await ProjectFile.loadWithPicker();
      props.onProjectChange(new ProjectFileAction({ actionType: ProjectFileActionType.SetProject, args: { project } }));
    },
    [props]
  );

  const handleSave = useCallback(
    async function () {
      popupRef?.current?.close();
      await ProjectFile.saveWithPicker(props.project);
    },
    [props]
  );

  const handleImport = useCallback(
    async function (index: number) {
      popupRef?.current?.close();

      const importer = availableExporters[index];

      const palette = await importer.importWithPicker();
      props.onProjectChange(new ProjectFileAction({ actionType: ProjectFileActionType.SetPalette, args: { palette } }));
    },
    [props]
  );

  const handleExport = useCallback(
    async function (index: number) {
      popupRef?.current?.close();

      const exporter = availableExporters[index];

      await exporter.exportWithPicker(props.project.palette);
    },
    [props]
  );

  const importers = [];
  const exporters = [];

  for (const [i, exporter] of availableExporters.entries()) {
    const info = exporter.filetypeInfo();

    importers.push(
      <PopupMenuItem
        key={i}
        index={i}
        name={`${info.description} (.${info.extensions.join(", ")})`}
        description={`Import from ${info.description}`}
        onItemSelect={handleImport}
      />
    );
  }

  for (const [i, exporter] of availableExporters.entries()) {
    const info = exporter.filetypeInfo();

    exporters.push(
      <PopupMenuItem
        key={i}
        index={i}
        name={`${info.description} (.${info.extensions.join(", ")})`}
        description={`Export to ${info.description}`}
        onItemSelect={handleExport}
      />
    );
  }

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
          name="Load Project File"
          description="Load a Palettejuicer project from JSON stored on your local drive."
          onItemSelect={handleLoad}
        />
        <PopupMenuItem
          key={2}
          index={2}
          name="Save Project File"
          description="Save a Palettejuicer project to JSON stored on your local drive."
          onItemSelect={handleSave}
        />
        <PopupMenuSeparatorItem />
        <PopupMenuItem key={3} index={3} name="Import">
          {importers}
        </PopupMenuItem>
        <PopupMenuItem key={4} index={4} name="Export">
          {exporters}
        </PopupMenuItem>
      </DropdownButton>
      <ConfirmPopup confirmOpen={confirmOpen} setConfirmOpen={setConfirmOpen} onConfirm={handleReallyClear} />
    </>
  );
}

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
            <button onClick={handleUndo} disabled={!props.history.hasUndo()} title="Undo">
              <i className="fa-solid icon-undo"></i>
            </button>
            <button onClick={handleRedo} disabled={!props.history.hasRedo()} title="Redo">
              <i className="fa-solid icon-redo"></i>
            </button>
          </div>
          <button onClick={handleTutorial}>Tutorial</button>
          <AboutMenu />
        </div>
      </div>
      <Tutorial popupOpen={tutorialOpen} setPopupOpen={setTutorialOpen} />
    </>
  );
}
