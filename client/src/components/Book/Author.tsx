import * as React from "react";
import { Link } from "react-router-dom";
import { BooksLangContext } from "../../contexts/books-lang";
import { Author, Lang } from "../../domain/core";
import { getAuthorPageUrl } from "../../utils/routing-utils";

export interface AuthorProps {
  author: Author;
}

// TODO: i18n
export function Author(props: AuthorProps) {
  const author: Author = props.author;

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <div className="author-container">
          <h6>The author</h6>

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
          </p>
          <p className="nb-books">
            We have {author.nbBooks} books from this author on Good Auld Books
          </p>
        </div>
      )}
    </BooksLangContext.Consumer>
  );
}
