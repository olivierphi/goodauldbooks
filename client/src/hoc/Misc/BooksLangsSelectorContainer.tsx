import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { BooksLangsSelector } from "../../components/Misc/BooksLangsSelector";
import { container } from "../../ServicesContainer";
import { AppState } from "../../store";
import { setLang } from "../../store/actions";

const booksLangsRepository = container.booksLangsRepository;

const mapStateToProps = (state: AppState) => {
  return {
    currentLang: state.lang,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    setLang: (lang: string): void => {
      dispatch(setLang(lang));
    },
  };
};

interface BooksLangsSelectorContainerHOCProps {
  currentLang: string;
  setLang: (lang: string) => void;
}

export function BooksLangsSelectorContainerHOC(props: BooksLangsSelectorContainerHOCProps) {
  const onLangChange = (lang: string) => {
    props.setLang(lang);
  };

  return (
    <BooksLangsSelector
      currentLang={props.currentLang}
      booksLangs={booksLangsRepository.getAllLangs()}
      onLangChange={onLangChange}
    />
  );
}

export const BooksLangsSelectorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BooksLangsSelectorContainerHOC);
