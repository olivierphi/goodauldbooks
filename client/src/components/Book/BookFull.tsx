import * as React from "react";
import { CurrentLangContext } from "../../contexts/lang";
import { Book, Lang } from "../../domain/core";

export interface BookFullProps {
  bookId: string;
  book: Book;
}

export function BookFull(props: BookFullProps) {
  const book = props.book;
  const author = book.author;

  return (
    <CurrentLangContext.Consumer>
      {(currentLang: Lang) => (
        <>
          <h3>{book.title}</h3>
          <p className="author">
            <span className="author-name">
              {author.firstName} {author.lastName}
            </span>
          </p>
          <ul className="genres">
            {book.genres.map((name: string, i) => {
              return <li key={i}>{name}</li>;
            })}
          </ul>
        </>
      )}
    </CurrentLangContext.Consumer>
  );
}
