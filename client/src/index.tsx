import { ServicesLocator } from "domain/services";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "url-search-params-polyfill";
import { bootApp } from "./app-bootstrap";
import { Layout } from "./components/Layout";
import { AppEnvelope } from "./hoc/AppEnvelope";
import { servicesLocator } from "./ServicesLocator";

async function startApp(): Promise<boolean> {
  await bootApp();
  const appHtmlContainer = document.getElementById("app");
  if (appHtmlContainer !== null) {
    renderApp(appHtmlContainer, servicesLocator);
  }

  return Promise.resolve(true);
}

startApp().catch((reason) => {
  console.error("Can't start app!", reason); // tslint:disable-line
});

function renderApp(appHtmlContainer: HTMLElement, services: ServicesLocator): void {
  ReactDOM.render(
    <AppEnvelope servicesLocator={services}>
      <Layout />
    </AppEnvelope>,
    appHtmlContainer
  );
}
