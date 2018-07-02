import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooksLangContext } from "../contexts/books-lang";
import { Lang } from "../domain/core";
import { BooksByGenreContainer } from "../hoc/Book/BooksByGenreContainer";

export function GenrePage(routeProps: RouteComponentProps<{ genre: string }>): JSX.Element {
  const search = routeProps.location.search;
  const params = new URLSearchParams(search);
  const pageNumber = parseInt(params.get("page") || "1", 10);

  return (
    <section>
      <BooksLangContext.Consumer>
        {(currentBooksLang: Lang) => (
          <BooksByGenreContainer
            genre={routeProps.match.params.genre}
            pagination={{ page: pageNumber, nbPerPage: 6 }}
            currentBooksLang={currentBooksLang}
          />
        )}
      </BooksLangContext.Consumer>
    </section>
  );
}
