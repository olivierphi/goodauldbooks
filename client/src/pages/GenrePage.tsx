import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolboxContext } from "../contexts/hoc-toolbox";
import { Lang } from "../domain/core";
import { BooksByGenreContainer } from "../hoc/Book/BooksByGenreContainer";
import { HigherOrderComponentToolbox } from "../hoc/HigherOrderComponentToolbox";

export function GenrePage(routeProps: RouteComponentProps<{ genre: string }>): JSX.Element {
  const search = routeProps.location.search;
  const params = new URLSearchParams(search);
  const pageNumber = parseInt(params.get("page") || "1", 10);

  return (
    <section>
      <HigherOrderComponentToolboxContext.Consumer>
        {(hocToolbox: HigherOrderComponentToolbox) => (
          <BooksLangContext.Consumer>
            {(currentBooksLang: Lang) => (
              <BooksByGenreContainer
                genre={routeProps.match.params.genre}
                pagination={{ page: pageNumber, nbPerPage: 6 }}
                currentBooksLang={currentBooksLang}
                hocToolbox={hocToolbox}
              />
            )}
          </BooksLangContext.Consumer>
        )}
      </HigherOrderComponentToolboxContext.Consumer>
    </section>
  );
}
