import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider as ReduxStoreProvider } from "react-redux";
import { Hello } from "./components/Hello";
import { CurrentLangContext } from "./contexts/lang";
import { initStore } from "./store-init";

const store = initStore();

ReactDOM.render(
  <ReduxStoreProvider store={store}>
    <CurrentLangContext.Provider value="en">
      <Hello compiler="TypeScript" framework="React" />
    </CurrentLangContext.Provider>
  </ReduxStoreProvider>,
  document.getElementById("example")
);
