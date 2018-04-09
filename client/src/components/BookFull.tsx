import * as React from "react";
import { CurrentLangContext } from "../contexts/lang";
import { Book, Lang } from "../domain/core";

export interface BookFullProps {
  bookId: string;
  book: Book;
}

export function BookFull(props: BookFullProps) {
  return (
    <CurrentLangContext.Consumer>
      {(currentLang: Lang) => <h3>{props.book.title[currentLang]}</h3>}
    </CurrentLangContext.Consumer>
  );
}
