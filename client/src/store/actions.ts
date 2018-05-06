import { PaginationRequestData } from "../domain/queries";
import { container } from "../ServicesContainer";
import { Action } from "./index";

export enum Actions {
  FETCH_FEATURED_BOOKS = "FETCH_FEATURED_BOOKS",
  FETCH_BOOK = "FETCH_BOOK",
}

export function fetchFeaturedBooksList(): Action {
  const fetchBooksPromise = container.booksRepository.getFeaturedBooks();
  return { type: Actions.FETCH_FEATURED_BOOKS, payload: fetchBooksPromise };
}

export function fetchBook(bookId: string): Action {
  const fetchBookPromise = container.booksRepository.getBookById(bookId);
  return { type: Actions.FETCH_BOOK, payload: fetchBookPromise };
}
