import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooksByAuthorContainer } from "../hoc/Book/BooksByAuthorContainer";

export function AuthorPage(routeProps: RouteComponentProps<{ authorId: string }>): JSX.Element {
  return (
    <section className="box">
      <BooksByAuthorContainer authorId={routeProps.match.params.authorId} />
    </section>
  );
}
