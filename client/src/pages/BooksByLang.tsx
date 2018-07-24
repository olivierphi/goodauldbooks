import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Head } from "../components/Layout/Head";
import { HigherOrderComponentToolkitContext } from "../contexts/hoc-toolkit";
import { Lang } from "../domain/core";
import { BooksByLangContainer } from "../hoc/Book/BooksByLangContainer";
import { HigherOrderComponentToolkit } from "../hoc/HigherOrderComponentToolkit";

export function BooksByLangPage(routeProps: RouteComponentProps<{ booksLang: Lang }>): JSX.Element {
  const search = routeProps.location.search;
  const params = new URLSearchParams(search);
  const pageNumber = parseInt(params.get("page") || "1", 10);

  return (
    <>
      <Head isLandingPage={false} />
      <section>
        <HigherOrderComponentToolkitContext.Consumer>
          {(hocToolkit: HigherOrderComponentToolkit) => (
            <BooksByLangContainer
              currentBooksLang={routeProps.match.params.booksLang}
              pagination={{ page: pageNumber, nbPerPage: 6 }}
              hocToolkit={hocToolkit}
            />
          )}
        </HigherOrderComponentToolkitContext.Consumer>
      </section>
    </>
  );
}
