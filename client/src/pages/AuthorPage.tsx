import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooksByAuthorContainer } from "../hoc/Book/BooksByAuthorContainer";

export function AuthorPage(routeProps: RouteComponentProps<{ authorId: string }>): JSX.Element {
  const search = routeProps.location.search;
  const params = new URLSearchParams(search);
  const pageNumber = parseInt(params.get("page") || "1", 10);

  return (
    <section className="box">
      <BooksByAuthorContainer
        authorId={routeProps.match.params.authorId}
        pagination={{ page: pageNumber, nbPerPage: 6 }}
      />
    </section>
  );
}
