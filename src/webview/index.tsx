import * as React from "react";
import * as ReactDOM from "react-dom";
import ContextMaster from "./components/ContextMaster";
import { ContextMasterProvider } from "./components/ContextMaster/context";

import "./styles/globals.css";
import { Toaster } from "./webview/components/ui/toaster";
import { ThemeProvider } from "./ThemeProvider";

function App() {
  return (
    <>
      <Toaster />
      <ThemeProvider>
        <ContextMasterProvider>
          <ContextMaster />
        </ContextMasterProvider>
      </ThemeProvider>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
