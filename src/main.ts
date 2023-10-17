import { inject } from "@vercel/analytics";
import React, { createElement } from "react";
import ReactDOM from "react-dom/client";
import Router from "./Router";
import "./assets/scss/main.scss";
inject();

const root = document.getElementById("app");

if (!root) {
  throw new Error("Catastrophic Failure! Failed to load application!");
}

ReactDOM.createRoot(root).render(
  createElement(React.StrictMode, null, [
    createElement(Router, { key: "router" }),
  ])
);
