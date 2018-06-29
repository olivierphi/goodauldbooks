import * as React from "react";
import * as ReactDOM from "react-dom";
import "url-search-params-polyfill";
import { bootApp } from "./app-bootstrap";
import { Layout } from "./components/Layout";
import { AppEnvelope } from "./hoc/AppEnvelope";
async function startApp(): Promise<boolean> {
  await bootApp();
  const appHtmlContainer = document.getElementById("app");
  if (appHtmlContainer !== null) {
    renderApp(appHtmlContainer);
  }

  return Promise.resolve(true);
}

startApp().catch((reason) => {
  console.error("Can't start app!", reason);
});

function renderApp(appHtmlContainer: HTMLElement): void {
  ReactDOM.render(
    <AppEnvelope>
      <Layout />
    </AppEnvelope>,
    appHtmlContainer
  );
}
