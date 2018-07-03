import * as React from "react";
import { Link } from "react-router-dom";
import { AssetsConfigContext } from "../../contexts/assets-config";
import { BooksLangContext } from "../../contexts/books-lang";
import { Book, Lang } from "../../domain/core";
import { AssetsConfig } from "../../domain/web";
import { getBookPageUrl } from "../../utils/routing-utils";

interface BookCoverProps {
  book: Book;
}

export function BookCover(props: BookCoverProps) {
  const hasCover: boolean = null !== props.book.coverUrl;
  const className = hasCover ? "has-cover" : "no-cover";
  const bookUrl = (currentBooksLang: Lang, book: Book) => {
    return getBookPageUrl(currentBooksLang, book.lang, book.author.slug, book.slug, book.id);
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
                    src={`${assetsConfig.coversBaseUrl}${props.book.coverUrl}`}
                    alt={props.book.title}
                  />
                ) : (
                  <span className="title">{props.book.title}</span>
                )}
              </span>
            </Link>
          )}
        </AssetsConfigContext.Consumer>
      )}
    </BooksLangContext.Consumer>
  );
}
