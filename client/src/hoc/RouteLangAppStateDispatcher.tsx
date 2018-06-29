import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { Action } from "redux";
import { AppState } from "../store";
import { setCurrentBooksLang } from "../store/actions";

const mapStateToProps = (state: AppState, ownProps: { currentBooksLang: string }) => {
  return {
    currentBooksLangInState: state.currentBooksLang,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    setNewBooksLang: (lang: string) => {
      dispatch(setCurrentBooksLang(lang));
    },
  };
};

interface RouteLangAppStateDispatcherHOCProps {
  currentBooksLangInState: string;
  currentBooksLang: string;
  setNewBooksLang: (lang: string) => void;
}

function RouteLangAppStateDispatcherHOC(props: RouteLangAppStateDispatcherHOCProps) {
  if (props.currentBooksLang && props.currentBooksLang !== props.currentBooksLangInState) {
    props.setNewBooksLang(props.currentBooksLang);
  }
  return <h1>currentBooksLang={props.currentBooksLang}</h1>;
}

const RouteLangAppStateDispatcher = connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteLangAppStateDispatcherHOC);

export function RouteLangAppStateDispatcherWithRouter(
  routeProps: RouteComponentProps<{ booksLang: string }>
): JSX.Element {
  return <RouteLangAppStateDispatcher currentBooksLang={routeProps.match.params.booksLang} />;
}
