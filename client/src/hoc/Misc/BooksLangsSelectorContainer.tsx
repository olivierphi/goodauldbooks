import { Lang } from "domain/core";
import * as React from "react";
import { BooksLangsSelector } from "../../components/Misc/BooksLangsSelector";
import { BooksLangContext } from "../../contexts/books-lang";
import { ACTIONS } from "../../domain/messages";
import { replaceBooksLangInLocation } from "../../utils/url-utils";
import { OmniponentComponentToolbox } from "../OmnipotentComponentToolbox";

interface BooksLangsSelectorContainerProps {
  hocToolbox: OmniponentComponentToolbox;
}

export function BooksLangsSelectorContainer(props: BooksLangsSelectorContainerProps) {
  const servicesLocator = props.hocToolbox.servicesLocator;

  const availableBooksLangs = servicesLocator.booksLangsRepository.getAllLangs();

  const onLangChange = (lang: string) => {
    const newUrl = replaceBooksLangInLocation(servicesLocator.history.location, lang);
    props.hocToolbox.messageBus.emit(ACTIONS.PUSH_URL, newUrl);
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
