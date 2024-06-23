import { useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useImmer, useImmerReducer } from "use-immer";

import { AppBody } from "./AppBody";
import { AppMenubar } from "./menubar/AppMenubar";
import { ProjectReducer, ProjectConsolidator } from "../reducers/ProjectReducer";
import { Project } from "../model/Project";
import { LocalStorage } from "../storage/LocalStorage";
import { OopsView } from "./OopsView";
import { ClipboardContext } from "../contexts/ClipboardContext";
import { Clipboard } from "../model/Clipboard";
import { HistoryAction, HistoryActionType, createHistoryReducer } from "../reducers/HistoryReducer";
import { UndoHistory } from "../model/UndoHistory";
import { AppOptions } from "../model/AppOptions";
import { AppGreeter } from "./AppGreeter";
import { Tutorial } from "./tutorial/Tutorial";
import { AppState } from "../model/AppState";
import { AppStateContext, AppStateSetterContext } from "../contexts/AppStateContext";

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
const initialAppState = new AppState(initialOptions);
const initialHistory = new UndoHistory(initialProject);
const historyReducer = createHistoryReducer(Project, ProjectReducer, ProjectConsolidator);
const initialClipboard = new Clipboard();

function updateViewport() {
  const landscape = window.screen.orientation.type.includes("landscape");
  const viewportSettings = landscape ? "height=850" : "width=500";

  document.querySelector('meta[name="viewport"]')?.setAttribute("content", viewportSettings + " initial-scale=1");
}

updateViewport();

export function AppBoundary() {
  const [history, dispatchHistory] = useImmerReducer(historyReducer, initialHistory);
  const [clipboard] = useState(initialClipboard);
  const [appState, setAppState] = useImmer(initialAppState);

  useEffect(() => {
    Autosaver.waitAndAutosave(history.current());
  }, [history]);

  useEffect(() => {
    function handleBeforeUnload() {
      Autosaver.autosaveNow(history.current());
      LocalStorage.save("Options", appState.options);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [history, appState.options]);

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

  const setTutorialOpen = useCallback(
    function (open: boolean) {
      setAppState((draft) => {
        draft.tutorialOpen = open;
      });
    },
    [setAppState]
  );

  const project = history.current();

  return (
    <>
      <AppStateContext.Provider value={appState}>
        <AppStateSetterContext.Provider value={setAppState}>
          <ClipboardContext.Provider value={clipboard}>
            <div id="app-wrapper">
              <div id="app-header">
                <div className="logo" />
                <AppMenubar history={history} onHistoryChange={dispatchHistory} />
              </div>
              {project.palette ? (
                <AppBody palette={project.palette} onProjectChange={dispatchHistory} />
              ) : (
                <AppGreeter project={project} onProjectChange={dispatchHistory} />
              )}
            </div>
            <Tutorial popupOpen={appState.tutorialOpen} setPopupOpen={setTutorialOpen} />
          </ClipboardContext.Provider>
        </AppStateSetterContext.Provider>
      </AppStateContext.Provider>
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
