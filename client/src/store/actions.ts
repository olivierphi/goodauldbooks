import { PaginationRequestData } from "../domain/queries";
import { container } from "../ServicesContainer";
import { Action } from "./index";

export enum Actions {
  FETCH_ALL_BOOKS = "FETCH_ALL_BOOKS",
}

export function fetchBooksList(pagination: PaginationRequestData): Action {
  const fetchBooksPromise = container.booksRepository.getBooks(pagination);
  return { type: Actions.FETCH_ALL_BOOKS, payload: fetchBooksPromise };
}
