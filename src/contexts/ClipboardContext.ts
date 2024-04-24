import { createContext } from "react";
import { Clipboard } from "../model/Clipboard";

export const ClipboardContext = createContext(new Clipboard());
