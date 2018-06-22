import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BookFullContainer } from "../hoc/Book/BookFullContainer";

export function BookPage(routeProps: RouteComponentProps<{ bookId: string }>): JSX.Element {
  return (
    <section>
      <BookFullContainer bookId={routeProps.match.params.bookId} />
    </section>
  );
}
