import { Draft, produce } from "immer";
import { UndoHistory } from "../model/UndoHistory";

export const enum HistoryActionType {
  Undo,
  Redo,
}

export class HistoryAction {
  actionType!: HistoryActionType;

  constructor(options: HistoryAction) {
    Object.assign(this, options);
  }
}

function HistoryActionReducer<T>(draft: Draft<UndoHistory<T>>, action: HistoryAction) {
  switch (action.actionType) {
    case HistoryActionType.Undo:
      return draft.undo();
    case HistoryActionType.Redo:
      return draft.redo();
  }
}

export function createHistoryReducer<T, A extends object>(
  _classType: { new (): T },
  reducer: (reducerDraft: Draft<T>, action: A) => any,
  consolidator: (previousAction: A, currentAction: A) => boolean
) {
  return function (draft: Draft<UndoHistory<T>>, action: A | HistoryAction) {
    let updated;

    switch (action.constructor) {
      case HistoryAction:
        return HistoryActionReducer(draft, action as HistoryAction);

      default:
        updated = produce(draft.current(), (itemDraft) => {
          return reducer(itemDraft, action as A);
        });
        return draft.autoConsolidate(updated, action as A, consolidator);
    }
  };
}
