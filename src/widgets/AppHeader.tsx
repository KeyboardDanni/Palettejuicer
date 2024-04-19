import { useCallback } from "react";

import { DropdownButton } from "./common/DropdownButton";
import { ProjectAction, ProjectFileAction, ProjectFileActionType } from "../reducers/ProjectReducer";
import { FilePicker } from "../storage/FilePicker";
import { Project } from "../model/Project";

export type AppHeaderProps = {
  project: Project;
  onProjectChange: React.Dispatch<ProjectAction>;
};

type MenubarMenuItem = {
  name: string;
  description: string;
  beginGroup?: boolean;
  onSelected?: (props: AppHeaderProps) => void;
};

const fileMenuItems: MenubarMenuItem[] = [
  {
    name: "Clear",
    description: "Start over with a new project.",
    onSelected: function (props: AppHeaderProps): void {
      props.onProjectChange(new ProjectFileAction({ actionType: ProjectFileActionType.Clear }));
    },
  },
  {
    name: "Load from JSON",
    description: "Load a Palettejuicer project from JSON stored on your local drive.",
    beginGroup: true,
    onSelected: async function (props: AppHeaderProps) {
      const project = await FilePicker.load(Project);

      props.onProjectChange(new ProjectFileAction({ actionType: ProjectFileActionType.Set, args: { project } }));
    },
  },
  {
    name: "Save to JSON",
    description: "Save a Palettejuicer project to JSON stored on your local drive.",
    onSelected: async function (props: AppHeaderProps) {
      await FilePicker.save(props.project);
    },
  },
];

export function AppHeader(props: AppHeaderProps) {
  const handleFileSelect = useCallback(
    (index: number) => {
      const item = fileMenuItems[index];
      if (item.onSelected) item.onSelected(props);
    },
    [props]
  );

  return (
    <>
      <div id="app-header">
        <div id="logo" />
        <div id="menubar">
          <DropdownButton label="File" items={fileMenuItems} onItemSelect={handleFileSelect} />
        </div>
      </div>
    </>
  );
}
