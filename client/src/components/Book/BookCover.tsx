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
  const hasCover: boolean = null !== book.cover;
  const className = hasCover ? "has-cover" : "no-cover";
  return (
    <AssetsConfigContext.Consumer>
      {(assetsConfig: AssetsConfig) => (
        <Link to={getBookPageUrl(book.id)}>
          <span className={["book-cover", className].join(" ")}>
            {hasCover ? (
              <img src={`${assetsConfig.coversBaseUrl}${book.cover}`} alt={book.title} />
            ) : (
              <span className="title">{book.title}</span>
            )}
          </span>
        </Link>
      )}
    </AssetsConfigContext.Consumer>
  );
}
