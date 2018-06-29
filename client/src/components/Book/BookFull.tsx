import * as React from "react";
import { BookFull, GenreWithStats } from "../../domain/core";
import { BookIntroContainer } from "../../hoc/Book/BookIntroContainer";
import { Author } from "./Author";
import { BookCover } from "./BookCover";
import { EbookDownloadLinks } from "./EbookDownloadLinks";
import { GenresAsTags } from "./GenresAsTags";

export interface BookFullProps {
  book: BookFull;
  genresWithStats: GenreWithStats[];
  currentBooksLang: string;
}

export function BookFull(props: BookFullProps) {
  const book = props.book;

  return (
    <div className="columns book-full">
      <div className="column">
        <div className="box">
          <div className="box-header">
            <BookCover book={book} />
          </div>
        </div>
      </div>
      <div className="column is-three-quarters">
        <div className="box book-data">
          <div className="box-content">
            <h3>{book.title}</h3>
            {book.subtitle ? <h4>{book.subtitle}</h4> : ""}
            <GenresAsTags
              currentBooksLang={props.currentBooksLang}
              genresWithStats={props.genresWithStats}
            />
            <Author author={book.author} />
            <EbookDownloadLinks book={book} />
            <BookIntroContainer bookId={book.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
