import { EVENTS } from "domain/messages";
import { AssetsConfig } from "domain/web";
import * as React from "react";
import { I18nextProvider } from "react-i18next";
import { Router } from "react-router-dom";
import { AppConfig } from "../app-config";
import { AssetsConfigContext } from "../contexts/assets-config";
import { BooksLangContext } from "../contexts/books-lang";
import { MessageBusContext } from "../contexts/message-bus";
import { servicesLocator } from "../ServicesLocator";

interface AppEnvelopeState {
  booksLang: string;
  assetsConfig: AssetsConfig;
}

/**
 * This is where we initialise all our global React Context Providers
 */
export class AppEnvelope extends React.Component<{}, AppEnvelopeState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      booksLang: servicesLocator.appStateStore.getState().booksLang,
      assetsConfig: { coversBaseUrl: AppConfig.coversBaseURL },
    };
    this.onBooksLangChanged = this.onBooksLangChanged.bind(this);
  }

  public componentDidMount() {
    servicesLocator.messageBus.on(EVENTS.BOOKS_LANG_CHANGED, this.onBooksLangChanged);
  }

  public componentWillUnmount() {
    servicesLocator.messageBus.off(EVENTS.BOOKS_LANG_CHANGED, this.onBooksLangChanged);
  }

  public render() {
    return (
      <MessageBusContext.Provider value={servicesLocator.messageBus}>
        <BooksLangContext.Provider value={this.state.booksLang}>
          <I18nextProvider i18n={servicesLocator.i18n}>
            <AssetsConfigContext.Provider value={this.state.assetsConfig}>
              <Router history={servicesLocator.history}>
                <>
                  {/* And here comes our app !*/}
                  {this.props.children}
                </>
              </Router>
            </AssetsConfigContext.Provider>
          </I18nextProvider>
        </BooksLangContext.Provider>
      </MessageBusContext.Provider>
    );
  }

  private onBooksLangChanged(newBooksLang: string) {
    this.setState({
      booksLang: newBooksLang,
    });
  }
}
