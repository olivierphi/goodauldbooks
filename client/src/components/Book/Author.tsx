import * as React from "react";
import { Link } from "react-router-dom";
import { BooksLangContext } from "../../contexts/books-lang";
import { Author, Lang } from "../../domain/core";
import { getAuthorPageUrl } from "../../utils/routing-utils";

export interface AuthorProps {
  author: Author;
}

export function Author(props: AuthorProps) {
  const author: Author = props.author;

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <p className="author">
          <Link to={getAuthorPageUrl(currentBooksLang, author.slug, author.id)} className="name">
            {author.firstName} {author.lastName}
          </Link>
          {author.birthYear || author.deathYear ? (
            <span className="life-period">
              ({author.birthYear || "?"} - {author.deathYear || "?"})
            </span>
          ) : (
            ""
          )}
          <span className="nb-books">
            {author.nbBooks} books on Good Auld Books {/* TODO: i18n */}
          </span>
        </p>
      )}
    </BooksLangContext.Consumer>
  );
}
