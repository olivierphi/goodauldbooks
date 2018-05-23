import * as React from "react";
import { BookFull, GenreWithStats } from "../../domain/core";
import { Author } from "./Author";
import { BookCover } from "./BookCover";
import { EbookDownloadLinks } from "./EbookDownloadLinks";
import { GenresAsTags } from "./GenresAsTags";

export interface BookFullProps {
  book: BookFull;
  genresWithStats: GenreWithStats[];
}

export function BookFull(props: BookFullProps) {
  const book = props.book;

  return (
    <div className="book-full">
      <BookCover book={book} />
      <div className="book-data">
        <h3>{book.title}</h3>
        {book.subtitle ? <h4>{book.subtitle}</h4> : ""}
        <GenresAsTags genresWithStats={props.genresWithStats} />
        <Author author={book.author} />
        <EbookDownloadLinks book={book} />
      </div>
    </div>
  );
}
