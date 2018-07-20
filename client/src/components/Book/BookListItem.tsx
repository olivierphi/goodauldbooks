import * as React from "react";
import { Link } from "react-router-dom";
import * as truncate from "smart-truncate";
import { BooksLangContext } from "../../contexts/books-lang";
import { Book, Lang } from "../../domain/core";
import { getAuthorPageUrl, getBookPageUrl } from "../../utils/routing-utils";
import { BookCover } from "./BookCover";

export interface ListItemProps {
  book: Book;
}

export function BookListItem(props: ListItemProps) {
  const bookUrl = (currentBooksLang: Lang, book: Book) => {
    return getBookPageUrl(currentBooksLang, book.lang, book.author.slug, book.slug, book.id);
  };

  const title = truncate(props.book.title, 41, { position: 20 });

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <div className="grid-item">
          <div className="box book-list-item">
            <div className="box-header">
              <BookCover book={props.book} />
            </div>
            <div className="box-content">
              <h3 className="book-title">
                <Link to={bookUrl(currentBooksLang, props.book)}>{title}</Link>
              </h3>
              {props.book.subtitle ? <p className="book-subtitle">{props.book.subtitle}</p> : ""}
              <p className="book-author">
                <Link
                  to={getAuthorPageUrl(
                    currentBooksLang,
                    props.book.author.slug,
                    props.book.author.id
                  )}
                  className="name"
                >
                  {props.book.author.firstName} {props.book.author.lastName}
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </BooksLangContext.Consumer>
  );
}
