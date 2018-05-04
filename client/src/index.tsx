import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider as ReduxStoreProvider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { bootApp } from "./app-bootstrap";
import { AppConfig } from "./app-config";
import { Header } from "./components/Header";
import { AssetsConfigContext } from "./contexts/assets-config";
import { CurrentLangContext } from "./contexts/lang";
import { Lang } from "./domain/core";
import { BookPage } from "./pages/BookPage";
import { HomePage } from "./pages/HomePage";
import { container } from "./ServicesContainer";

async function startApp(): Promise<boolean> {
  await bootApp();
  const appContainer = document.getElementById("app");
  if (appContainer !== null) {
    renderApp(appContainer);
  }

  return Promise.resolve(true);
}

startApp();

function renderApp(appContainer: HTMLElement) {
  ReactDOM.render(
    <ReduxStoreProvider store={container.appStateStore}>
      <CurrentLangContext.Provider value={Lang.EN}>
        <AssetsConfigContext.Provider
          value={{
            coversBaseUrl: AppConfig.coversBaseURL,
          }}
        >
          <Router>
            <>
              <Header />
              <Route exact={true} path="/" component={HomePage} />
              <Route path="/books/:bookId" component={BookPage} />
            </>
          </Router>
        </AssetsConfigContext.Provider>
      </CurrentLangContext.Provider>
    </ReduxStoreProvider>,
    appContainer
  );
}
