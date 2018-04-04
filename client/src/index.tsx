import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider as ReduxStoreProvider } from "react-redux";
import { Header } from "./components/Header";
import { CurrentLangContext } from "./contexts/lang";
import { BookPage } from "./pages/BookPage";
import { HomePage } from "./pages/HomePage";
import { initStore } from "./store-init";

import { BrowserRouter as Router, Link, Route } from "react-router-dom";

const store = initStore();

ReactDOM.render(
  <ReduxStoreProvider store={store}>
    <CurrentLangContext.Provider value="en">
      <Header />
      <Router>
        <>
          <Route exact={true} path="/" component={HomePage} />
          <Route path="/books/:bookId" component={BookPage} />
        </>
      </Router>
    </CurrentLangContext.Provider>
  </ReduxStoreProvider>,
  document.getElementById("app")
);
