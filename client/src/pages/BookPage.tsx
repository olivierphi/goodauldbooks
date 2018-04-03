import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Main } from "../components/Main";
import { BookFullContainer } from "../containers/BookFullContainer";

export function BookPage(routeProps: RouteComponentProps<{ bookId: string }>) {
  return (
    <>
      <h1>Book {routeProps.match.params.bookId}</h1>
      <Main />
      <BookFullContainer bookId={routeProps.match.params.bookId} />
    </>
  );
}
