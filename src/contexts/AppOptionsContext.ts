import { createContext } from "react";
import { Updater } from "use-immer";

import { AppOptions } from "../model/AppOptions";

export const AppOptionsContext = createContext<AppOptions>(new AppOptions());
export const AppOptionsSetterContext = createContext<Updater<AppOptions>>(() => {});
