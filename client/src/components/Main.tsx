// tslint:disable: max-line-length
import * as React from "react";
import { Route } from "react-router";
import { AuthorPage } from "../pages/AuthorPage";
import { BookPage } from "../pages/BookPage";
import { GenrePage } from "../pages/GenrePage";
import { HomePage } from "../pages/HomePage";

export function Main() {
  return (
    <section id="main" className="container">
      <Route exact={true} path="/" component={HomePage} />
      <Route
        exact={true}
        path="/library/:booksLang([a-z]{2,3})/book/:lang([a-z]{2,3})/:authorSlug([a-z0-9-]+)/:book_slug([a-z0-9-]+)/:bookId(pg?[0-9]+)"
        component={BookPage}
      />
      <Route
        exact={true}
        path="/library/:booksLang([a-z]{2,3})/author/:authorSlug([a-z0-9-]+)/:authorId(pg?[0-9]+)"
        component={AuthorPage}
      />
      <Route
        exact={true}
        path="/library/:booksLang([a-z]{2,3})/genre/:genre"
        component={GenrePage}
      />
    </section>
  );
}
