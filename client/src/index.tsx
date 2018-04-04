import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider as ReduxStoreProvider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { CurrentLangContext } from "./contexts/lang";
import { Lang } from "./domain/core";
import { BookPage } from "./pages/BookPage";
import { HomePage } from "./pages/HomePage";
import { container } from "./ServicesContainer";

ReactDOM.render(
  <ReduxStoreProvider store={container.appStateStore}>
    <CurrentLangContext.Provider value={Lang.EN}>
      <Router>
        <>
          <Header />
          <Route exact={true} path="/" component={HomePage} />
          <Route path="/books/:bookId" component={BookPage} />
        </>
      </Router>
    </CurrentLangContext.Provider>
  </ReduxStoreProvider>,
  document.getElementById("app")
);
