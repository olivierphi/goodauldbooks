import * as React from "react";
import { CurrentLangContext } from "../contexts/lang";
import { Book, BooksById, Genre } from "../domain";
import { PaginationRequestData } from "../repositories/api";

export interface BooksListProps {
  books: BooksById;
}

export interface BooksListPropsWithActions extends BooksListProps {
  fetchBooksList: (pagination: PaginationRequestData) => void;
}

export const BooksList = (props: BooksListPropsWithActions) => {
  const booksList: Book[] = Object.values(props.books);

  if (!booksList.length) {
    props.fetchBooksList({ page: 1, nbPerPage: 10 });
    return <div className="loading">Loading books...</div>;
  }

  return (
    <CurrentLangContext.Consumer>
      {(currentLang: string) => (
        <ul className="books-list">
          {booksList.map((book: Book) => {
            return (
              <li key={book.id}>
                {book.title[currentLang]}{" "}
                {book.genres.map((genre: Genre) => genre.name[currentLang])}
              </li>
            );
          })}
        </ul>
      )}
    </CurrentLangContext.Consumer>
  );
};
