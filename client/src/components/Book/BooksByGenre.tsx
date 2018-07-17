import * as React from "react";
import { Link } from "react-router-dom";
import { BooksById, Lang, LANG_ALL } from "../../domain/core";
import { PaginationResponseData } from "../../domain/queries";
import { getGenrePageUrl } from "../../utils/routing-utils";
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
        {props.paginationResponseData.totalCount} books for this genre in this language ({
          props.currentBooksLang
        })
      </h4>
      {props.currentBooksLang === LANG_ALL ? (
        ""
      ) : (
        <Link to={getGenreBooksPageUrlForAllLanguages()}>
          ({props.paginationResponseData.totalCountForAllLangs} for all languages)
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
