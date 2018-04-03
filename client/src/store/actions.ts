import { PaginationRequestData } from "../domain/queries";
import { container } from "../ServicesContainer";
import { Action } from "./index";

export enum Actions {
  FETCH_ALL_BOOKS = "FETCH_ALL_BOOKS",
  FETCH_BOOK = "FETCH_BOOK",
}

export function fetchBooksList(pagination: PaginationRequestData): Action {
  const fetchBooksPromise = container.booksRepository.getBooks(pagination);
  return { type: Actions.FETCH_ALL_BOOKS, payload: fetchBooksPromise };
}

export function fetchBook(bookId: string): Action {
  const fetchBookPromise = container.booksRepository.getBookById(bookId);
  return { type: Actions.FETCH_BOOK, payload: fetchBookPromise };
}
