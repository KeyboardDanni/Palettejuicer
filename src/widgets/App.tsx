import { useEffect, useState } from "react";
import { useImmerReducer } from "use-immer";

import { AppBody } from "./AppBody";
import { AppHeader } from "./AppHeader";
import { ProjectReducer, ProjectConsolidator } from "../reducers/ProjectReducer";
import { Project } from "../model/Project";
import { LocalStorage } from "../storage/LocalStorage";
import { ErrorBoundary } from "react-error-boundary";
import { OopsView } from "./OopsView";
import { ClipboardContext } from "../contexts/ClipboardContext";
import { Clipboard } from "../model/Clipboard";
import { createHistoryReducer } from "../reducers/HistoryReducer";
import { UndoHistory } from "../model/UndoHistory";

const AUTOSAVE_DELAY_MS = 3000;

class Autosaver {
  static timeoutId: number | null = null;

  static autosaveNow(project: Project) {
    LocalStorage.save("Project", project);
  }

  static waitAndAutosave(project: Project) {
    if (Autosaver.timeoutId) {
      clearTimeout(Autosaver.timeoutId);
    }

    Autosaver.timeoutId = setTimeout(() => {
      Autosaver.autosaveNow(project);
    }, AUTOSAVE_DELAY_MS);
  }
}

const initialProject = LocalStorage.load("Project", Project);
const initialHistory = new UndoHistory(initialProject);
const historyReducer = createHistoryReducer(Project, ProjectReducer, ProjectConsolidator);

export function AppBoundary() {
  const [history, dispatchHistory] = useImmerReducer(historyReducer, initialHistory);
  const [clipboard] = useState(new Clipboard());

  useEffect(() => {
    Autosaver.waitAndAutosave(history.current());
  }, [history]);
  useEffect(() => {
    function handleBeforeUnload() {
      Autosaver.autosaveNow(history.current());
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [history]);

  return (
    <>
      <ClipboardContext.Provider value={clipboard}>
        <div id="app-wrapper">
          <AppHeader history={history} onHistoryChange={dispatchHistory} />
          <AppBody project={history.current()} onProjectChange={dispatchHistory} />
        </div>
      </ClipboardContext.Provider>
    </>
  );
}

export function App() {
  return (
    <>
      <ErrorBoundary fallbackRender={OopsView}>
        <AppBoundary />
      </ErrorBoundary>
    </>
  );
}
