import * as React from "react";
import { CurrentLangContext } from "../../contexts/lang";
import { Book, BooksById, Lang } from "../../domain/core";
import { BookListItem } from "./BookListItem";

export interface BooksListProps {
  books: BooksById;
}

export const BooksList = (props: BooksListProps) => {
  return (
    <CurrentLangContext.Consumer>
      {(currentLang: Lang) => (
        <div className="grid books-list">
          {Object.values(props.books).map((book: Book) => {
            return <BookListItem book={book} currentLang={currentLang} key={book.id} />;
          })}
        </div>
      )}
    </CurrentLangContext.Consumer>
  );
};
