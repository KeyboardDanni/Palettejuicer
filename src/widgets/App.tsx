import { useCallback, useEffect, useState } from "react";
import { useImmer, useImmerReducer } from "use-immer";

import { AppBody } from "./AppBody";
import { AppHeader } from "./AppHeader";
import { ProjectReducer, ProjectConsolidator } from "../reducers/ProjectReducer";
import { Project } from "../model/Project";
import { LocalStorage } from "../storage/LocalStorage";
import { ErrorBoundary } from "react-error-boundary";
import { OopsView } from "./OopsView";
import { ClipboardContext } from "../contexts/ClipboardContext";
import { Clipboard } from "../model/Clipboard";
import { HistoryAction, HistoryActionType, createHistoryReducer } from "../reducers/HistoryReducer";
import { UndoHistory } from "../model/UndoHistory";
import { AppOptionsContext, AppOptionsSetterContext } from "../contexts/AppOptionsContext";
import { AppOptions } from "../model/AppOptions";

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

    Autosaver.timeoutId = window.setTimeout(() => {
      Autosaver.autosaveNow(project);
    }, AUTOSAVE_DELAY_MS);
  }
}

const initialProject = LocalStorage.load("Project", Project);
const initialOptions = LocalStorage.load("Options", AppOptions);
const initialHistory = new UndoHistory(initialProject);
const historyReducer = createHistoryReducer(Project, ProjectReducer, ProjectConsolidator);
const initialClipboard = new Clipboard();

function updateViewport() {
  const landscape = window.screen.orientation.type.includes("landscape");
  const viewportSettings = landscape ? "height=850" : "width=500";

  document.querySelector('meta[name="viewport"]')?.setAttribute("content", viewportSettings);
}

updateViewport();

export function AppBoundary() {
  const [history, dispatchHistory] = useImmerReducer(historyReducer, initialHistory);
  const [clipboard] = useState(initialClipboard);
  const [appOptions, setAppOptions] = useImmer(initialOptions);

  useEffect(() => {
    Autosaver.waitAndAutosave(history.current());
  }, [history]);

  useEffect(() => {
    function handleBeforeUnload() {
      Autosaver.autosaveNow(history.current());
      LocalStorage.save("Options", appOptions);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [history, appOptions]);

  useEffect(() => {
    window.screen.orientation.addEventListener("change", updateViewport);

    return () => {
      window.screen.orientation.removeEventListener("change", updateViewport);
    };
  }, []);

  const handleKey = useCallback(
    function (event: KeyboardEvent) {
      switch (event.key) {
        case "z":
          if (event.ctrlKey && !event.shiftKey) {
            dispatchHistory(new HistoryAction({ actionType: HistoryActionType.Undo }));
            event.preventDefault();
          }
          break;
        case "Z":
          if (event.ctrlKey && event.shiftKey) {
            dispatchHistory(new HistoryAction({ actionType: HistoryActionType.Redo }));
            event.preventDefault();
          }
          break;
      }
    },
    [dispatchHistory]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [handleKey, dispatchHistory]);

  return (
    <>
      <AppOptionsContext.Provider value={appOptions}>
        <AppOptionsSetterContext.Provider value={setAppOptions}>
          <ClipboardContext.Provider value={clipboard}>
            <div id="app-wrapper">
              <AppHeader history={history} onHistoryChange={dispatchHistory} />
              <AppBody project={history.current()} onProjectChange={dispatchHistory} />
            </div>
          </ClipboardContext.Provider>
        </AppOptionsSetterContext.Provider>
      </AppOptionsContext.Provider>
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
