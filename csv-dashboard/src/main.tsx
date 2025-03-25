import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { FileProvider } from "./context/FileContext";  // Import FileProvider
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <FileProvider>
        <App />
      </FileProvider>
    </BrowserRouter>
  </React.StrictMode>
);
