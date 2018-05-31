import * as React from "react";
import { Author } from "../../domain/core";
import { getAuthorPageUrl } from "../../utils/routing-utils";

export interface AuthorProps {
  author: Author;
}

export function Author(props: AuthorProps) {
  const author: Author = props.author;

  return (
    <p className="author">
      <a href={getAuthorPageUrl(author.slug, author.id)} className="name">
        {author.firstName} {author.lastName}
      </a>
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
  );
}
