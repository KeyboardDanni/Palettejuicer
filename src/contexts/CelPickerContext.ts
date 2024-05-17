import { createContext } from "react";

import { CelIndex } from "../util/cel";

export type CelPickerData = {
  currentIndex: CelIndex;
  onAccept: (cel: CelIndex) => void;
  onReset: () => void;
};

export const CelPickerContext = createContext<CelPickerData | null>(null);
export const CelPickerSetterContext = createContext<React.Dispatch<React.SetStateAction<CelPickerData | null>> | null>(
  null
);
