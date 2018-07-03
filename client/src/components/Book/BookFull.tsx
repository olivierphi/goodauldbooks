import * as React from "react";
import { OmnipotentComponentToolkitContext } from "../../contexts/omnipotent-component-toolkit";
import { BookFull, GenreWithStats, Lang } from "../../domain/core";
import { BookIntroContainer } from "../../hoc/Book/BookIntroContainer";
import { OmniponentComponentToolkit } from "../../hoc/OmnipotentComponentToolkit";
import { Author } from "./Author";
import { BookCover } from "./BookCover";
import { EbookDownloadLinks } from "./EbookDownloadLinks";
import { GenresAsTags } from "./GenresAsTags";

export interface BookFullProps {
  book: BookFull;
  genresWithStats: GenreWithStats[];
  currentBooksLang: Lang;
}

export function BookFull(props: BookFullProps) {
  const book = props.book;

  return (
    <OmnipotentComponentToolkitContext.Consumer>
      {(omnipotentToolkit: OmniponentComponentToolkit) => (
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
                <h3>
                  {book.title} - {props.currentBooksLang}
                </h3>
                {book.subtitle ? <h4>{book.subtitle}</h4> : ""}
                <GenresAsTags
                  currentBooksLang={props.currentBooksLang}
                  genresWithStats={props.genresWithStats}
                />
                <Author author={book.author} />
                <EbookDownloadLinks book={book} />
                <BookIntroContainer bookId={book.id} hocToolkit={omnipotentToolkit} />
              </div>
            </div>
          </div>
        </div>
      )}
    </OmnipotentComponentToolkitContext.Consumer>
  );
}
