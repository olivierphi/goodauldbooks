import * as React from "react";
import { Book } from "../domain/core";

export interface BookFullProps {
  bookId: string;
  book: Book;
}

export function BookFull(props: BookFullProps) {
  return <h3>{props.book.title.en}</h3>;
}
