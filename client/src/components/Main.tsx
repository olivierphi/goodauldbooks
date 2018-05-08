import * as React from "react";
import { Route } from "react-router";
import { AuthorPage } from "../pages/AuthorPage";
import { BookPage } from "../pages/BookPage";
import { HomePage } from "../pages/HomePage";

export interface MainProps {}

export function Main(props: MainProps) {
  return (
    <section id="main" className="container">
      <Route exact={true} path="/" component={HomePage} />
      <Route
        path="/library/book/:lang([a-z]{2,3})/:author_slug([a-z0-9-]+)/:book_slug([a-z0-9-]+)/:bookId(g?[0-9]+)"
        component={BookPage}
      />
      <Route path="/library/author/:authorId" component={AuthorPage} />
    </section>
  );
}
