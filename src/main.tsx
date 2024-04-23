import "reflect-metadata";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./widgets/App";
import "./styles/style.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
