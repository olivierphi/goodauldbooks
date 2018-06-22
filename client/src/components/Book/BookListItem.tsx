import * as React from "react";
import { Link } from "react-router-dom";
import { Book } from "../../domain/core";
import { getAuthorPageUrl, getBookPageUrl } from "../../utils/routing-utils";
import { BookCover } from "./BookCover";

export interface ListItemProps {
  book: Book;
}

export function BookListItem(props: ListItemProps) {
  const book = props.book;
  const bookUrl = getBookPageUrl(book.lang, book.author.slug, book.slug, book.id);

  return (
    <div className="column is-one-third">
      <div className="box book-list-item">
        <div className="box-header">
          <BookCover book={book} />
        </div>
        <div className="box-content">
          <h3 className="book-title">
            <Link to={bookUrl}>{book.title}</Link>
          </h3>
          {book.subtitle ? <p className="book-subtitle">{book.subtitle}</p> : ""}
          <p className="book-author">
            <Link to={getAuthorPageUrl(book.author.slug, book.author.id)} className="name">
              {book.author.firstName} {book.author.lastName}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
