import * as React from "react";
import { Provider as ReduxStoreProvider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { AppConfig } from "../app-config";
import { AssetsConfigContext } from "../contexts/assets-config";
import { CurrentLangContext } from "../contexts/lang";
import { Lang } from "../domain/core";
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
      <CurrentLangContext.Provider value={Lang.EN}>
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
      </CurrentLangContext.Provider>
    </ReduxStoreProvider>
  );
}
