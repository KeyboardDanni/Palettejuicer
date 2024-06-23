import { createContext } from "react";
import { Updater } from "use-immer";

import { AppState } from "../model/AppState";

export const AppStateContext = createContext<AppState>(new AppState());
export const AppStateSetterContext = createContext<Updater<AppState>>(() => {});
