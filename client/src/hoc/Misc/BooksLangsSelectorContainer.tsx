import { Lang } from "domain/core";
import * as React from "react";
import { BooksLangsSelector } from "../../components/Misc/BooksLangsSelector";
import { BooksLangContext } from "../../contexts/books-lang";
import { ACTIONS } from "../../domain/messages";
import { servicesLocator } from "../../ServicesLocator";
import { replaceBooksLangInLocation } from "../../utils/url-utils";

export function BooksLangsSelectorContainer() {
  const booksLangsRepository = servicesLocator.booksLangsRepository;
  const messageBus = servicesLocator.messageBus;
  const history = servicesLocator.history;

  const onLangChange = (lang: string) => {
    const newUrl = replaceBooksLangInLocation(history.location, lang);
    messageBus.emit(ACTIONS.PUSH_URL, newUrl);
  };

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <BooksLangsSelector
          currentBooksLang={currentBooksLang}
          availableBooksLangs={booksLangsRepository.getAllLangs()}
          onLangChange={onLangChange}
        />
      )}
    </BooksLangContext.Consumer>
  );
}
