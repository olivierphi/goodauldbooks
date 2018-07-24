import * as React from "react";
import { BooksById, Lang } from "../../domain/core";
import { PaginationResponseData } from "../../domain/queries";
import { BooksList } from "./BooksList";

interface BooksByLangProps {
  lang: Lang;
  langBooks: BooksById;
  paginationResponseData: PaginationResponseData;
  navigateToPageNum: (pageNum: number) => void;
}

export function BooksByLang(props: BooksByLangProps) {
  // TODO: i18n
  return (
    <>
      <h3 className="books-list-title">Books for language "{props.lang}"</h3>

      <BooksList
        books={props.langBooks}
        pagination={props.paginationResponseData}
        navigateToPageNum={props.navigateToPageNum}
      />
    </>
  );
}
