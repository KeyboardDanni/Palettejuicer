import { immerable } from "immer";

import { AppOptions } from "./AppOptions";

export class AppState {
  [immerable] = true;

  readonly tutorialOpen: boolean = false;
  readonly options: AppOptions;

  constructor(options?: AppOptions) {
    this.options = options ?? new AppOptions();
  }
}
