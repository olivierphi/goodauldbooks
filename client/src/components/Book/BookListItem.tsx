import * as React from "react";
import { Link } from "react-router-dom";
import { Book } from "../../domain/core";
import { getBookPageUrl } from "../../utils/routing-utils";
import { BookCover } from "./BookCover";

export interface ListItemProps {
  book: Book;
}

export function BookListItem(props: ListItemProps) {
  const book = props.book;
  const bookUrl = getBookPageUrl(book.lang, book.author.slug, book.slug, book.id);

  return (
    <div className="grid-item book-list-item">
      <div className="header">
        <BookCover book={book} />
      </div>
      <h3 className="book-title">
        <Link to={bookUrl}>{book.title}</Link>
      </h3>
      {book.subtitle ? <p className="book-subtitle">{book.subtitle}</p> : ""}
      <p className="book-author">
        {book.author.firstName} {book.author.lastName}
      </p>
    </div>
  );
}
