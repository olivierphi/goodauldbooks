import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider as ReduxStoreProvider } from "react-redux";
import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { CurrentLangContext } from "./contexts/lang";
import { initStore } from "./store-init";

const store = initStore();

ReactDOM.render(
  <ReduxStoreProvider store={store}>
    <CurrentLangContext.Provider value="en">
      <Header />
      <Main />
    </CurrentLangContext.Provider>
  </ReduxStoreProvider>,
  document.getElementById("app")
);
