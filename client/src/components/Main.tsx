import * as React from "react";
import { Route } from "react-router";
import { BookPage } from "../pages/BookPage";
import { HomePage } from "../pages/HomePage";

export interface MainProps {}

export function Main(props: MainProps) {
  return (
    <main role="main">
      <div className="container">
        <Route exact={true} path="/" component={HomePage} />
        <Route path="/books/:bookId" component={BookPage} />
      </div>
    </main>
  );
}
