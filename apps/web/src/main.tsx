import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, StaticDemo } from "./App";
import "./styles.css";

const Root = import.meta.env.VITE_STATIC_DEMO === "true" ? StaticDemo : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
