import * as React from "react";
import { BooksById, Lang, LANG_ALL } from "../../domain/core";
import { getGenrePageUrl } from "../../utils/routing-utils";
import { PaginationResponseData } from "../../domain/queries";
import { Link } from "react-router-dom";
import { BooksList } from "./BooksList";

interface BooksByGenreProps {
  genre: string;
  genreBooks: BooksById;
  currentBooksLang: Lang;
  paginationResponseData: PaginationResponseData;
  navigateToPageNum: (pageNum: number) => void;
}

export function BooksByGenre(props: BooksByGenreProps) {
  const getGenreBooksPageUrlForAllLanguages = (): string => {
    return getGenrePageUrl(LANG_ALL, props.genre);
  };

  // TODO: i18n
  return (
    <>
      <h4>
        {props.paginationResponseData.nbResultsTotal} books for this genre in this language ({
          props.currentBooksLang
        })
      </h4>
      {props.currentBooksLang === LANG_ALL ? (
        ""
      ) : (
        <Link to={getGenreBooksPageUrlForAllLanguages()}>
          ({props.paginationResponseData.nbResultsTotalForAllLangs} for all languages)
        </Link>
      )}

      <BooksList
        books={props.genreBooks}
        pagination={props.paginationResponseData}
        navigateToPageNum={props.navigateToPageNum}
      />
    </>
  );
}
