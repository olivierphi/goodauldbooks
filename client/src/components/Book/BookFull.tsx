import * as React from "react";
import { CurrentLangContext } from "../../contexts/lang";
import { Book, GenreWithStats, Lang } from "../../domain/core";
import { Author } from "./Author";
import { GenresAsTags } from "./GenresAsTags";

export interface BookFullProps {
  book: Book;
  genresWithStats: GenreWithStats[];
}

export function BookFull(props: BookFullProps) {
  const book = props.book;

  return (
    <CurrentLangContext.Consumer>
      {(currentLang: Lang) => (
        <div className="book-full">
          <h3>{book.title}</h3>
          {book.subtitle ? <h4>{book.subtitle}</h4> : ""}
          <GenresAsTags genresWithStats={props.genresWithStats} />
          <Author author={book.author} />
        </div>
      )}
    </CurrentLangContext.Consumer>
  );
}
