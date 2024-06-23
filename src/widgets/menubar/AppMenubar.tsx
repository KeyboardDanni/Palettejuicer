import { useCallback, useContext } from "react";

import { ProjectAction } from "../../reducers/ProjectReducer";
import { Project } from "../../model/Project";
import { HistoryAction, HistoryActionType } from "../../reducers/HistoryReducer";
import { UndoHistory } from "../../model/UndoHistory";

import { FileMenu } from "./FileMenu";
import { AboutMenu } from "./AboutMenu";
import { OptionsMenu } from "./OptionsMenu";
import { AppStateSetterContext } from "../../contexts/AppStateContext";

export type AppMenubarProps = {
  history: UndoHistory<Project>;
  onHistoryChange: React.Dispatch<HistoryAction | ProjectAction>;
};

export function AppMenubar(props: AppMenubarProps) {
  const setAppState = useContext(AppStateSetterContext);
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
      setAppState((draft) => {
        draft.tutorialOpen = true;
      });
    },
    [setAppState]
  );

  return (
    <>
      <div id="menubar">
        <FileMenu project={props.history.current()} onProjectChange={props.onHistoryChange} />
        <div id="undo-redo-group">
          <button onClick={handleUndo} disabled={!props.history.hasUndo()} title="Undo">
            <i className="icon-undo"></i>
          </button>
          <button onClick={handleRedo} disabled={!props.history.hasRedo()} title="Redo">
            <i className="icon-redo"></i>
          </button>
        </div>
        <OptionsMenu />
        <button onClick={handleTutorial}>Tutorial</button>
        <AboutMenu />
      </div>
    </>
  );
}
