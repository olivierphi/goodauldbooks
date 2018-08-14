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
  const bookUrl = (currentBooksLang: Lang, targetBook: Book) => {
    return getBookPageUrl(
      currentBooksLang,
      targetBook.lang,
      targetBook.author.slug,
      targetBook.slug,
      targetBook.id
    );
  };

  const book = props.book;
  const title = truncate(book.title, 70, { mark: " [...]" });

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <div className="grid-item">
          <div className="box book-list-item">
            <div className="box-header">
              <BookCover book={book} />
            </div>
            <div className="box-content">
              <h3 className="book-title">
                <Link to={bookUrl(currentBooksLang, book)}>{title}</Link>
              </h3>
              {book.subtitle ? <p className="book-subtitle">{book.subtitle}</p> : ""}
              <p className="book-author">
                <Link
                  to={getAuthorPageUrl(currentBooksLang, book.author.slug, book.author.id)}
                  className="name"
                >
                  {book.author.firstName} {book.author.lastName}
                </Link>
              </p>
              <p className="nb-pages">{book.nbPages} pages</p>
            </div>
          </div>
        </div>
      )}
    </BooksLangContext.Consumer>
  );
}
