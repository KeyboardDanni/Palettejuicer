import { useCallback, useRef, useState } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import Popup from "reactjs-popup";
import { DropdownMenuButton } from "../common/DropdownButton";
import { ProjectAction, ProjectFileAction, ProjectFileActionType } from "../../reducers/ProjectReducer";
import { Project } from "../../model/Project";
import { ProjectFile } from "../../storage/ProjectFile";
import { PopupMenuItem, PopupMenuSeparatorItem } from "../common/PopupMenu";
import { Exporter } from "../../storage/exporters/Exporter";
import { GnuPaletteExporter } from "../../storage/exporters/GnuPaletteExporter";
import { JascPalExporter } from "../../storage/exporters/JascPalExporter";

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
      <DropdownMenuButton popupRef={popupRef} label="File">
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
      </DropdownMenuButton>
      <ConfirmPopup confirmOpen={confirmOpen} setConfirmOpen={setConfirmOpen} onConfirm={handleReallyClear} />
    </>
  );
}
