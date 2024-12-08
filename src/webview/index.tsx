import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles/globals.css";
import { ThemeProvider } from "./providers/themeProvider";
import { GlobalContextProvider } from "./providers/globalStateContext";
import Main from "./components";

function App() {
  return (
    <>
      <ThemeProvider>
        <GlobalContextProvider>
          <Main />
        </GlobalContextProvider>
      </ThemeProvider>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
