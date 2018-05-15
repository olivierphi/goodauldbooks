import * as React from "react";
import { Link } from "react-router-dom";
import { AssetsConfigContext } from "../../contexts/assets-config";
import { Book } from "../../domain/core";
import { AssetsConfig } from "../../domain/web";
import { getBookPageUrl } from "../../utils/routing-utils";

interface BookCoverProps {
  book: Book;
}

export function BookCover(props: BookCoverProps) {
  const book = props.book;
  const hasCover: boolean = null !== book.coverUrl;
  const className = hasCover ? "has-cover" : "no-cover";
  const bookUrl = getBookPageUrl(book.lang, book.author.slug, book.slug, book.id);
  return (
    <AssetsConfigContext.Consumer>
      {(assetsConfig: AssetsConfig) => (
        <Link to={bookUrl}>
          <span className={["book-cover", className].join(" ")}>
            {hasCover ? (
              <img src={`${assetsConfig.coversBaseUrl}${book.coverUrl}`} alt={book.title} />
            ) : (
              <span className="title">{book.title}</span>
            )}
          </span>
        </Link>
      )}
    </AssetsConfigContext.Consumer>
  );
}
