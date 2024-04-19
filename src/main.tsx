import "reflect-metadata";

import { setAutoFreeze } from "immer";

// Needed so that class-transformer works with immer
setAutoFreeze(false);

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./widgets/App";
import "./styles/style.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
