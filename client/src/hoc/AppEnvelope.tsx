import { EVENTS } from "domain/messages";
import { ServicesLocator } from "domain/services";
import { AssetsConfig } from "domain/web";
import * as React from "react";
import { I18nextProvider } from "react-i18next";
import { Router } from "react-router-dom";
import { AppConfig } from "../app-config";
import { AssetsConfigContext } from "../contexts/assets-config";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolkitContext } from "../contexts/hoc-toolkit";
import { MessageBusContext } from "../contexts/message-bus";
import { OmnipotentComponentToolkitContext } from "../contexts/omnipotent-component-toolkit";
import { HigherOrderComponentToolkit } from "./HigherOrderComponentToolkit";
import { OmniponentComponentToolkit } from "./OmnipotentComponentToolkit";

interface AppEnvelopeProps {
  servicesLocator: ServicesLocator;
}

interface AppEnvelopeState {
  hocToolkit: HigherOrderComponentToolkit;
  omnipotentComponentToolkit: OmniponentComponentToolkit;
  assetsConfig: AssetsConfig;
  booksLang: string;
}

/**
 * This is where we initialise all our global React Context Providers
 */
export class AppEnvelope extends React.Component<AppEnvelopeProps, AppEnvelopeState> {
  constructor(props: AppEnvelopeProps) {
    super(props);

    this.state = this.getInitialState();
    this.onBooksLangChanged = this.onBooksLangChanged.bind(this);
  }

  public componentDidMount() {
    this.props.servicesLocator.messageBus.on(EVENTS.BOOKS_LANG_CHANGED, this.onBooksLangChanged);
  }

  public componentWillUnmount() {
    this.props.servicesLocator.messageBus.off(EVENTS.BOOKS_LANG_CHANGED, this.onBooksLangChanged);
  }

  public render() {
    // Hope you like "Context.Provider Hell"... :-P
    return (
      <OmnipotentComponentToolkitContext.Provider value={this.state.omnipotentComponentToolkit}>
        <HigherOrderComponentToolkitContext.Provider value={this.state.hocToolkit}>
          <MessageBusContext.Provider value={this.props.servicesLocator.messageBus}>
            <BooksLangContext.Provider value={this.state.booksLang}>
              <I18nextProvider i18n={this.props.servicesLocator.i18n}>
                <AssetsConfigContext.Provider value={this.state.assetsConfig}>
                  <Router history={this.props.servicesLocator.history}>
                    <>
                      {/* And here comes our app !*/}
                      {this.props.children}
                    </>
                  </Router>
                </AssetsConfigContext.Provider>
              </I18nextProvider>
            </BooksLangContext.Provider>
          </MessageBusContext.Provider>
        </HigherOrderComponentToolkitContext.Provider>
      </OmnipotentComponentToolkitContext.Provider>
    );
  }

  private getInitialState(): AppEnvelopeState {
    const hocToolkit = {
      appStateStore: this.props.servicesLocator.appStateStore,
      actionsDispatcher: this.props.servicesLocator.actionsDispatcher,
      messageBus: this.props.servicesLocator.messageBus,
    };
    const omnipotentComponentToolkit = {
      ...hocToolkit,
      servicesLocator: this.props.servicesLocator,
    };

    return {
      hocToolkit,
      omnipotentComponentToolkit,
      booksLang: this.props.servicesLocator.appStateStore.getState().booksLang,
      assetsConfig: { coversBaseUrl: AppConfig.coversBaseURL },
    };
  }

  private onBooksLangChanged(newBooksLang: string) {
    this.setState({
      booksLang: newBooksLang,
    });
  }
}
