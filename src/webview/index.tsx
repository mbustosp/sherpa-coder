import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles/globals.css";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./providers/themeProvider";
import { GlobalContextProvider } from "./providers/globalStateContext";
import Main from "./components";

function App() {
  return (
    <>
      <Toaster />
      <ThemeProvider>
        <GlobalContextProvider>
          <Main />
        </GlobalContextProvider>
      </ThemeProvider>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
