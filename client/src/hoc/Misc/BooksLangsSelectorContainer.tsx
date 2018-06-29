import * as React from "react";
import { BooksLangsSelector } from "../../components/Misc/BooksLangsSelector";
import { BooksLangContext } from "../../contexts/books-lang";
import { ACTIONS } from "../../domain/messages";
import { container } from "../../ServicesContainer";

export function BooksLangsSelectorContainer() {
  const booksLangsRepository = container.booksLangsRepository;
  const messageBus = container.messageBus;

  const onLangChange = (lang: string) => {
    const newUrl = location.pathname.replace(/^\/library\/[a-z]{2,3}\//, `/library/${lang}/`);
    messageBus.emit(ACTIONS.PUSH_URL, newUrl);
  };

  return (
    <BooksLangContext.Consumer>
      {(lang: string) => (
        <BooksLangsSelector
          currentBooksLang={lang}
          availableBooksLangs={booksLangsRepository.getAllLangs()}
          onLangChange={onLangChange}
        />
      )}
    </BooksLangContext.Consumer>
  );
}
