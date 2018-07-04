import * as React from "react";
import { BooksById, Lang, LANG_ALL } from "../../domain/core";
import { Link } from "react-router-dom";
import { BooksList } from "./BooksList";
import { PaginationResponseData } from "../../domain/queries";
import { getAuthorPageUrl } from "../../utils/routing-utils";

interface BooksByAuthorProps {
  authorId: string;
  authorSlug: string;
  authorBooks: BooksById;
  currentBooksLang: Lang;
  paginationResponseData: PaginationResponseData;
  navigateToPageNum: (pageNum: number) => void;
}

export function BooksByAuthor(props: BooksByAuthorProps) {
  const getAuthorBooksPageUrlForAllLanguages = (): string => {
    return getAuthorPageUrl(LANG_ALL, props.authorSlug, props.authorId);
  };

  // TODO: i18n
  return (
    <>
      <h4>
        {props.paginationResponseData.nbResultsTotal} books for this author in this language ({
          props.currentBooksLang
        })
      </h4>
      {props.currentBooksLang === LANG_ALL ? (
        ""
      ) : (
        <Link to={getAuthorBooksPageUrlForAllLanguages()}>
          ({props.paginationResponseData.nbResultsTotalForAllLangs} for all languages)
        </Link>
      )}
      <BooksList
        books={props.authorBooks}
        pagination={props.paginationResponseData}
        navigateToPageNum={props.navigateToPageNum}
      />
    </>
  );
}
