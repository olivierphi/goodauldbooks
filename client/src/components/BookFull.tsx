import * as React from "react";
import { Book } from "../domain/core";

export interface BookFullProps {
  bookId: string;
  book: Book | null;
  fetchBook: (bookId: string) => void;
}

export function BookFull(props: BookFullProps) {
  if (!props.book) {
    props.fetchBook(props.bookId);
    return <div className="loading">Loading book...</div>;
  }

  return <h3>{props.book.title.en}</h3>;
}
