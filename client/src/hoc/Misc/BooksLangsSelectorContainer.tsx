import { Lang } from "domain/core";
import * as React from "react";
import { BooksLangsSelector } from "../../components/Misc/BooksLangsSelector";
import { BooksLangContext } from "../../contexts/books-lang";
import { ACTIONS } from "../../domain/messages";
import { container } from "../../ServicesContainer";
import { replaceBooksLangInLocation } from "../../utils/url-utils";

export function BooksLangsSelectorContainer() {
  const booksLangsRepository = container.booksLangsRepository;
  const messageBus = container.messageBus;
  const history = container.history;

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
