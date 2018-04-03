import * as React from "react";
import { BooksListContainer } from "../containers/BooksListContainer";

export interface MainProps {}

export function Main(props: MainProps) {
  return (
    <main role="main">
      <div className="container">
        <BooksListContainer />
      </div>
    </main>
  );
}
