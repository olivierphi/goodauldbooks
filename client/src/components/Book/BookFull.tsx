import * as React from "react";
import { HigherOrderComponentToolkitContext } from "../../contexts/hoc-toolkit";
import { BookFull, GenreWithStats, Lang } from "../../domain/core";
import { BookIntroContainer } from "../../hoc/Book/BookIntroContainer";
import { HigherOrderComponentToolkit } from "../../hoc/HigherOrderComponentToolkit";
import { Author } from "./Author";
import { BookCover } from "./BookCover";
import { EbookDownloadLinks } from "./EbookDownloadLinks";
import { GenresAsTags } from "./GenresAsTags";

export interface BookFullProps {
  book: BookFull;
  genresWithStats: GenreWithStats[];
  currentBooksLang: Lang;
}

// TODO: i18n
export function BookFull(props: BookFullProps) {
  const book = props.book;

  return (
    <HigherOrderComponentToolkitContext.Consumer>
      {(hocToolkit: HigherOrderComponentToolkit) => (
        <div className="grid book-full">
          <div className="grid-item cover-container">
            <div className="box">
              <div className="box-header">
                <BookCover book={book} />
              </div>
            </div>
          </div>
          {/* end .grid-item.cover-container */}

          <div className="grid-item main-container">
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
                {book.nbPages} pages
              </div>
            </div>
            {/* end .box.book-data */}

            {book.hasIntro ? (
              <div className="box book-intro-container">
                <h3>Start reading</h3>
                <BookIntroContainer bookId={book.id} hocToolkit={hocToolkit} />
              </div>
            ) : (
              ""
            )}
          </div>
          {/* end .grid-item main-container */}
        </div>
      )}
    </HigherOrderComponentToolkitContext.Consumer>
  );
}
