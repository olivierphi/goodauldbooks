import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolkitContext } from "../contexts/hoc-toolkit";
import { Lang } from "../domain/core";
import { BooksByAuthorContainer } from "../hoc/Book/BooksByAuthorContainer";
import { HigherOrderComponentToolkit } from "../hoc/HigherOrderComponentToolkit";

export function AuthorPage(routeProps: RouteComponentProps<{ authorId: string }>): JSX.Element {
  const search = routeProps.location.search;
  const params = new URLSearchParams(search);
  const pageNumber = parseInt(params.get("page") || "1", 10);

  return (
    <section className="box">
      <HigherOrderComponentToolkitContext.Consumer>
        {(hocToolkit: HigherOrderComponentToolkit) => (
          <BooksLangContext.Consumer>
            {(currentBooksLang: Lang) => (
              <BooksByAuthorContainer
                authorId={routeProps.match.params.authorId}
                pagination={{ page: pageNumber, nbPerPage: 6 }}
                currentBooksLang={currentBooksLang}
                hocToolkit={hocToolkit}
              />
            )}
          </BooksLangContext.Consumer>
        )}
      </HigherOrderComponentToolkitContext.Consumer>
    </section>
  );
}
