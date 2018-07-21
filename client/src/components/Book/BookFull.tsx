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
        <>
          <h2 className="page-title">
            <span className="book-title">{book.title}</span>
            {book.subtitle ? <span className="subtitle book-subtitle">{book.subtitle}</span> : ""}
          </h2>
          <div className="grid boxes-container book-full">
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
                <Author author={book.author} />
                <GenresAsTags
                  currentBooksLang={props.currentBooksLang}
                  genresWithStats={props.genresWithStats}
                />
                <EbookDownloadLinks book={book} />
                {book.nbPages} pages
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
        </>
      )}
    </HigherOrderComponentToolkitContext.Consumer>
  );
}
