import * as React from "react";
import { Link } from "react-router-dom";
import { BooksById, Lang, LANG_ALL } from "../../domain/core";
import { PaginationResponseData } from "../../domain/queries";
import { getAuthorPageUrl } from "../../utils/routing-utils";
import { BooksList } from "./BooksList";

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

  const authorBooksArray = Object.values(props.authorBooks);
  const author = authorBooksArray.length ? authorBooksArray[0].author : null;
  // TODO: i18n
  return (
    <>
      <h3 className="books-list-title">
        {author
          ? `${author.firstName} ${author.lastName}`
          : props.currentBooksLang !== LANG_ALL
            ? "No books for this author in this language, but we do have some in other languages"
            : ""}
      </h3>
      {props.currentBooksLang === LANG_ALL ? (
        ""
      ) : (
        <Link to={getAuthorBooksPageUrlForAllLanguages()}>
          ({props.paginationResponseData.totalCountForAllLangs} for all languages)
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
