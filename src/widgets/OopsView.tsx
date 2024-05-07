import { LocalStorage } from "../storage/LocalStorage";
import { Project } from "../model/Project";
import { ProjectFile } from "../storage/ProjectFile";

function onReload() {
  window.location.reload();
}

async function onReset() {
  const project = LocalStorage.load("Project", Project);

  try {
    await ProjectFile.saveWithPicker(project);
  } catch (error) {
    console.error(error);
  }

  LocalStorage.save("Project", new Project());

  window.location.reload();
}

async function onMakeBackup() {
  const project = LocalStorage.load("Project", Project);

  await ProjectFile.saveWithPicker(project);
}

export function OopsView() {
  return (
    <>
      <div id="app-wrapper">
        <div id="app-header">
          <div id="logo" />
        </div>
        <div id="app-oops-container">
          <div className="section popup-message-content">
            <div className="popup-header">Uh oh! Palettejuicer made a mess!</div>
            <p>
              Something went wrong and the app can't continue. You can try to fix this by clicking <b>Reload</b> below.
            </p>
            <p>
              If something is wrong with the project, you will need to click <b>Start Over</b>. This will clear your
              project, and you will lose unsaved changes. Before doing that, you may make a backup of your project by
              clicking <b>Save Backup</b>.
            </p>
            <div className="button-bar">
              <div className="button-bar-spacer" />
              <div className="button-bar-spacer" />
              <button onClick={onReload}>Reload</button>
              <button onClick={onMakeBackup}>Save Backup</button>
              <button className="danger" onClick={onReset}>
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
