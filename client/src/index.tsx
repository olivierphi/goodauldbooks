import * as React from "react";
import * as ReactDOM from "react-dom";
import { bootApp } from "./app-bootstrap";
import { Layout } from "./components/Layout";
import { AppEnvelope } from "./hoc/AppEnvelope";

async function startApp(): Promise<boolean> {
  await bootApp();
  const appContainer = document.getElementById("app");
  if (appContainer !== null) {
    renderApp(appContainer);
  }

  return Promise.resolve(true);
}

startApp().catch((reason) => {
  console.error("Can't start app!", reason);
});

function renderApp(appContainer: HTMLElement): void {
  ReactDOM.render(
    <AppEnvelope>
      <Layout />
    </AppEnvelope>,
    appContainer
  );
}
