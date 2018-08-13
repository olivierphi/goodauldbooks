import * as React from "react";
import { Link } from "react-router-dom";
import * as truncate from "smart-truncate";
import { AssetsConfigContext } from "../../contexts/assets-config";
import { BooksLangContext } from "../../contexts/books-lang";
import { Book, Lang } from "../../domain/core";
import { AssetsConfig } from "../../domain/web";
import { getBookPageUrl } from "../../utils/routing-utils";

interface BookCoverProps {
  book: Book;
}

// TODO: i18n
export function BookCover(props: BookCoverProps) {
  const hasCover: boolean = null !== props.book.coverUrl;
  const className = hasCover ? "has-cover" : "no-cover";

  const bookUrl = (currentBooksLang: Lang, book: Book) => {
    return getBookPageUrl(currentBooksLang, book.lang, book.author.slug, book.slug, book.id);
  };
  const noCover = (book: Book) => {
    return (
      <span className="no-cover-content">
        <span className="title">{truncate(book.title, 70, { mark: " [...]" })}</span>
        <span className="by">by</span>
        <span className="author">
          {book.author.firstName}&nbsp;{book.author.lastName}
        </span>
      </span>
    );
  };

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <AssetsConfigContext.Consumer>
          {(assetsConfig: AssetsConfig) => (
            <Link to={bookUrl(currentBooksLang, props.book)}>
              <span className={["book-cover", className].join(" ")}>
                {hasCover ? (
                  <img
                    src={`${assetsConfig.coversBaseUrl}/${props.book.coverUrl}`}
                    alt={props.book.title}
                  />
                ) : (
                  noCover(props.book)
                )}
              </span>
            </Link>
          )}
        </AssetsConfigContext.Consumer>
      )}
    </BooksLangContext.Consumer>
  );
}
