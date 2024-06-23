import { Project } from "../model/Project";
import { deserialize } from "./Serialize";

export function fetchJson(path: string) {
  const promise = fetch(path, {
    headers: {
      accept: "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw Error(`HTTP response ${response.status}: ${response.statusText}`);
    }

    return response.text();
  });

  return promise;
}

export async function fetchProject(path: string) {
  const projectJson = await fetchJson(path);
  const project = deserialize(projectJson, Project);

  return project;
}
