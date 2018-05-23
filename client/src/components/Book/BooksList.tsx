import * as React from "react";
import { Book, BooksById } from "../../domain/core";
import { BookListItem } from "./BookListItem";

export interface BooksListProps {
  books: BooksById;
}

export const BooksList = (props: BooksListProps) => {
  return (
    <div className="grid books-list">
      {Object.values(props.books).map((book: Book) => {
        return <BookListItem book={book} key={book.id} />;
      })}
    </div>
  );
};
