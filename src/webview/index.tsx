import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles/globals.css";
import { ThemeProvider } from "./providers/themeProvider";
import Main from "./components";
import { GlobalStateProvider } from "./providers/globalState/globalStateContext";

function App() {
  return (
    <>
      <ThemeProvider>
        <GlobalStateProvider>
          <Main />
        </GlobalStateProvider>
      </ThemeProvider>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
