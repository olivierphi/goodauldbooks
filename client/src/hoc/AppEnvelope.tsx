import { EVENTS } from "domain/messages";
import { ServicesLocator } from "domain/services";
import { AssetsConfig } from "domain/web";
import * as React from "react";
import { I18nextProvider } from "react-i18next";
import { Router } from "react-router-dom";
import { AppConfig } from "../app-config";
import { AssetsConfigContext } from "../contexts/assets-config";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolboxContext } from "../contexts/hoc-toolbox";
import { MessageBusContext } from "../contexts/message-bus";
import { OmnipotentComponentToolboxContext } from "../contexts/omnipotent-component-toolbox";
import { HigherOrderComponentToolbox } from "./HigherOrderComponentToolbox";
import { OmniponentComponentToolbox } from "./OmnipotentComponentToolbox";

interface AppEnvelopeProps {
  servicesLocator: ServicesLocator;
}

interface AppEnvelopeState {
  hocToolbox: HigherOrderComponentToolbox;
  omnipotentComponentToolbox: OmniponentComponentToolbox;
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
      <OmnipotentComponentToolboxContext.Provider value={this.state.omnipotentComponentToolbox}>
        <HigherOrderComponentToolboxContext.Provider value={this.state.hocToolbox}>
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
        </HigherOrderComponentToolboxContext.Provider>
      </OmnipotentComponentToolboxContext.Provider>
    );
  }

  private getInitialState(): AppEnvelopeState {
    const hocToolbox = {
      appStateStore: this.props.servicesLocator.appStateStore,
      actionsDispatcher: this.props.servicesLocator.actionsDispatcher,
      messageBus: this.props.servicesLocator.messageBus,
    };
    const omnipotentComponentToolbox = {
      ...hocToolbox,
      servicesLocator: this.props.servicesLocator,
    };

    return {
      hocToolbox,
      omnipotentComponentToolbox,
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
