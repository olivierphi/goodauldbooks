import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { BooksLangsSelector } from "../../components/Misc/BooksLangsSelector";
import { container } from "../../ServicesContainer";
import { AppState } from "../../store";

const booksLangsRepository = container.booksLangsRepository;

const mapStateToProps = (state: AppState) => {
  return {
    currentLang: state.currentBooksLang,
  };
};

interface BooksLangsSelectorContainerHOCProps {
  currentLang: string;
}

interface BooksLangsSelectorContainerHOCState {
  newLang: string | null;
}

export class BooksLangsSelectorContainerHOC extends React.Component<
  BooksLangsSelectorContainerHOCProps,
  BooksLangsSelectorContainerHOCState
> {
  constructor(props: BooksLangsSelectorContainerHOCProps) {
    super(props);
    this.state = { newLang: null };
    this.onLangChange = this.onLangChange.bind(this);
  }

  public render() {
    if (this.state.newLang && this.state.newLang !== this.props.currentLang) {
      const newUrl = location.pathname.replace(
        /^\/library\/[a-z]{2,3}\//,
        `/library/${this.state.newLang}/`
      );
      return <Redirect to={newUrl} push={true} />;
    }

    return (
      <BooksLangsSelector
        currentLang={this.props.currentLang}
        booksLangs={booksLangsRepository.getAllLangs()}
        onLangChange={this.onLangChange}
      />
    );
  }

  private onLangChange = (lang: string) => {
    if (this.props.currentLang === lang) {
      return;
    }
    this.setState({ newLang: lang });
  }
}

export const BooksLangsSelectorContainer = connect(mapStateToProps)(BooksLangsSelectorContainerHOC);
