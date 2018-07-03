import { Lang } from "domain/core";
import * as React from "react";
import { BooksLangsSelector } from "../../components/Misc/BooksLangsSelector";
import { BooksLangContext } from "../../contexts/books-lang";
import { ACTIONS } from "../../domain/messages";
import { replaceBooksLangInLocation } from "../../utils/url-utils";
import { OmniponentComponentToolkit } from "../OmnipotentComponentToolkit";

interface BooksLangsSelectorContainerProps {
  hocToolkit: OmniponentComponentToolkit;
}

export function BooksLangsSelectorContainer(props: BooksLangsSelectorContainerProps) {
  const servicesLocator = props.hocToolkit.servicesLocator;

  const availableBooksLangs = servicesLocator.booksLangsRepository.getAllLangs();

  const onLangChange = (lang: string) => {
    const newUrl = replaceBooksLangInLocation(servicesLocator.history.location, lang);
    props.hocToolkit.messageBus.emit(ACTIONS.PUSH_URL, newUrl);
  };

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <BooksLangsSelector
          currentBooksLang={currentBooksLang}
          availableBooksLangs={availableBooksLangs}
          onLangChange={onLangChange}
        />
      )}
    </BooksLangContext.Consumer>
  );
}
