import { useContext } from "react";
import { Palette } from "../model/Palette";
import { Project } from "../model/Project";
import { ProjectAction, ProjectFileAction, ProjectFileActionType } from "../reducers/ProjectReducer";
import { fetchProject } from "../storage/Fetch";
import { AppStateSetterContext } from "../contexts/AppStateContext";

export type AppGreeterProps = {
  project: Project;
  onProjectChange: React.Dispatch<ProjectAction>;
};

export function AppGreeter(props: AppGreeterProps) {
  const setAppState = useContext(AppStateSetterContext);

  function onEmpty() {
    props.onProjectChange(
      new ProjectFileAction({ actionType: ProjectFileActionType.SetPalette, args: { palette: new Palette() } })
    );
  }

  function onTutorial() {
    props.onProjectChange(
      new ProjectFileAction({ actionType: ProjectFileActionType.SetPalette, args: { palette: new Palette() } })
    );

    setAppState((draft) => {
      draft.tutorialOpen = true;
    });
  }

  async function onSample() {
    const project = await fetchProject("/assets/examples/ExamplePalette.json");

    props.onProjectChange(new ProjectFileAction({ actionType: ProjectFileActionType.SetProject, args: { project } }));
  }

  return (
    <>
      <div id="app-body">
        <div id="greeter" className="modal-popup">
          <div className="modal-popup-header modal-popup-header-spaced">
            <div className="logo" title="Palettejuicer" />
            <h2>Create striking color palettes quickly. Select a few colors and let calculations do the rest.</h2>
          </div>
          <div id="greeter-body">
            <button onClick={onTutorial}>View the Tutorial</button>
            <div id="greeter-project-buttons">
              <button onClick={onEmpty}>Create an Empty Project</button>
              <button onClick={onSample}>Try a Sample Project</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
