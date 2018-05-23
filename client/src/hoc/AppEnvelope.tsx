import * as React from "react";
import { I18nextProvider } from "react-i18next";
import { Provider as ReduxStoreProvider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { AppConfig } from "../app-config";
import { AssetsConfigContext } from "../contexts/assets-config";
import { container } from "../ServicesContainer";

interface AppEnvelopeProps {
  children?: React.ReactNode;
}

/**
 * This is where we initialise all our global React Context Providers
 */
export function AppEnvelope(props: AppEnvelopeProps) {
  return (
    <ReduxStoreProvider store={container.appStateStore}>
      <I18nextProvider i18n={container.i18n}>
        <AssetsConfigContext.Provider
          value={{
            coversBaseUrl: AppConfig.coversBaseURL,
          }}
        >
          <Router>
            <>
              {/* And here comes our app !*/}
              {props.children}
            </>
          </Router>
        </AssetsConfigContext.Provider>
      </I18nextProvider>
    </ReduxStoreProvider>
  );
}
