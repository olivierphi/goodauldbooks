import * as React from "react";
import { Author } from "../../domain/core";

export interface AuthorProps {
  author: Author;
}

export function Author(props: AuthorProps) {
  const author: Author = props.author;

  return (
    <p className="author">
      <span className="author-name">
        {author.firstName} {author.lastName}
      </span>
      {author.birthYear || author.deathYear ? (
        <span className="lifePeriod">
          {author.birthYear && author.deathYear ? (
            <>
              {author.birthYear} - {author.deathYear}
            </>
          ) : (
            ""
          )}
          {author.birthYear && !author.deathYear ? <>{author.birthYear} - ?</> : ""}
          {!author.birthYear && author.deathYear ? <>? - {author.deathYear}</> : ""}
        </span>
      ) : (
        ""
      )}
    </p>
  );
}
