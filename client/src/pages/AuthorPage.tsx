import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolboxContext } from "../contexts/hoc-toolbox";
import { Lang } from "../domain/core";
import { BooksByAuthorContainer } from "../hoc/Book/BooksByAuthorContainer";
import { HigherOrderComponentToolbox } from "../hoc/HigherOrderComponentToolbox";

export function AuthorPage(routeProps: RouteComponentProps<{ authorId: string }>): JSX.Element {
  const search = routeProps.location.search;
  const params = new URLSearchParams(search);
  const pageNumber = parseInt(params.get("page") || "1", 10);

  return (
    <section className="box">
      <HigherOrderComponentToolboxContext.Consumer>
        {(hocToolbox: HigherOrderComponentToolbox) => (
          <BooksLangContext.Consumer>
            {(currentBooksLang: Lang) => (
              <BooksByAuthorContainer
                authorId={routeProps.match.params.authorId}
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
