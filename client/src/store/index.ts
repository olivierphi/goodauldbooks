import { Book, BooksById } from "../domain/core";

export interface AppState {
  booksById: BooksById;
}

export interface Action {
  type: string;
  payload: any;
}
