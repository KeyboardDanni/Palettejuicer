import { castDraft, immerable, produce } from "immer";

import { clamp } from "../util/math";

const HISTORY_MAX = 100;

export type Consolidator<A> = (previousAction: A, currentAction: A) => boolean;

export class UndoHistory<T> {
  [immerable] = true;

  readonly history: T[];
  readonly currentIndex;
  readonly lastAction: any = null;

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
    const sameType = this.lastAction?.constructor === action.constructor;
    const shouldConsolidate = sameType ? consolidator(this.lastAction as A, action) : false;

    const newHistory = produce(this, (draft) => {
      draft.lastAction = action;
    });

    if (shouldConsolidate) {
      return newHistory.consolidate(state);
    }

    return newHistory.update(state);
  }

  undo(): UndoHistory<T> {
    const newHistory = produce(this, (draft) => {
      draft.currentIndex = clamp(draft.currentIndex - 1, 0, draft.history.length - 1);
    });

    return newHistory;
  }

  redo(): UndoHistory<T> {
    const newHistory = produce(this, (draft) => {
      draft.currentIndex = clamp(draft.currentIndex + 1, 0, draft.history.length - 1);
    });

    return newHistory;
  }
}
