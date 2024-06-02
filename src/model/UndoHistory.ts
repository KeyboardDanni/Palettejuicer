import { castDraft, immerable, produce } from "immer";

import { clamp } from "../util/math";

const HISTORY_MAX = 1000;
const CONSOLIDATE_MAX_TIME_MS = 2000;

export type Consolidator<A> = (previousAction: A, currentAction: A) => boolean;

export class UndoHistory<T> {
  [immerable] = true;

  readonly history: T[];
  readonly currentIndex;
  readonly lastAction: any = null;
  readonly lastChangeTime = Date.now();

  constructor(initialState: T) {
    this.history = [initialState];
    this.currentIndex = 0;
  }

  current(): T {
    return this.history[this.currentIndex];
  }

  update(state: T): UndoHistory<T> {
    const newHistory = produce(this, (draft) => {
      draft.history.splice(draft.currentIndex + 1);
      draft.history.splice(0, draft.history.length - HISTORY_MAX);
      draft.history.push(castDraft(state));

      draft.currentIndex = draft.history.length - 1;
    });

    return newHistory;
  }

  consolidate(state: T): UndoHistory<T> {
    const newHistory = produce(this, (draft) => {
      draft.history.splice(draft.currentIndex + 1);
      draft.history.splice(0, draft.history.length - HISTORY_MAX);

      draft.currentIndex = draft.history.length - 1;

      draft.history[draft.currentIndex] = castDraft(state);
    });

    return newHistory;
  }

  autoConsolidate<A extends object>(state: T, action: A, consolidator: Consolidator<A>): UndoHistory<T> {
    if (this.current() === state) {
      return this;
    }

    const sameType = this.lastAction?.constructor === action.constructor;
    const now = Date.now();
    const isRecent = now - this.lastChangeTime < CONSOLIDATE_MAX_TIME_MS;
    const shouldConsolidate = isRecent && sameType ? consolidator(this.lastAction as A, action) : false;

    const newHistory = produce(this, (draft) => {
      draft.lastAction = action;
      draft.lastChangeTime = now;
    });

    if (shouldConsolidate) {
      return newHistory.consolidate(state);
    }

    return newHistory.update(state);
  }

  undo(): UndoHistory<T> {
    const newHistory = produce(this, (draft) => {
      draft.currentIndex = clamp(draft.currentIndex - 1, 0, draft.history.length - 1);
      draft.lastAction = null;
    });

    return newHistory;
  }

  redo(): UndoHistory<T> {
    const newHistory = produce(this, (draft) => {
      draft.currentIndex = clamp(draft.currentIndex + 1, 0, draft.history.length - 1);
      draft.lastAction = null;
    });

    return newHistory;
  }

  hasUndo(): boolean {
    return this.currentIndex > 0;
  }

  hasRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
}
