import * as React from "react";
import { Link } from "react-router-dom";
import { Book, Lang } from "../../domain/core";
import { getBookPageUrl } from "../../utils/routing-utils";
import { BookCover } from "./BookCover";

export interface ListItemProps {
  book: Book;
  currentLang: Lang;
}

export function ListItem(props: ListItemProps) {
  const book = props.book;

  return (
    <div className="grid-item book-list-item">
      <div className="header">
        <BookCover book={book} />
      </div>
      <h3>
        <Link to={getBookPageUrl(book.id)}>{book.title}</Link>
      </h3>
      <p className="card-text">{book.genres.join(", ")}</p>
    </div>
  );
}
