import "reflect-metadata";

import { setAutoFreeze } from "immer";

// Needed so that class-transformer works with immer
setAutoFreeze(false);

import { useEffect } from "react";
import { useImmerReducer } from "use-immer";

import { AppBody } from "./widgets/AppBody";
import { AppHeader } from "./widgets/AppHeader";
import { ProjectReducer } from "./reducers/ProjectReducer";
import { Project } from "./model/Project";
import { LocalStorage } from "./storage/LocalStorage";

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

export function App() {
  const [project, dispatchProject] = useImmerReducer(ProjectReducer, initialProject);

  useEffect(() => {
    Autosaver.waitAndAutosave(project);
  }, [project]);
  useEffect(() => {
    function handleBeforeUnload() {
      Autosaver.autosaveNow(project);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.addEventListener("beforeunload", handleBeforeUnload);
    };
  }, [project]);

  return (
    <>
      <div id="app-wrapper">
        <AppHeader project={project} onProjectChange={dispatchProject} />
        <AppBody project={project} onProjectChange={dispatchProject} />
      </div>
    </>
  );
}
