import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooksByGenreContainer } from "../hoc/Book/BooksByGenreContainer";

export function GenrePage(routeProps: RouteComponentProps<{ genre: string }>): JSX.Element {
  return (
    <section className="box">
      <BooksByGenreContainer genre={routeProps.match.params.genre} />
    </section>
  );
}
