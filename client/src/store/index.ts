import { Book, BooksById, Uuid } from "../domain";

export interface AppState {
  booksById: BooksById;
}

export interface Action {
  type: string;
  payload: any;
}

export const EMPTY_STATE: AppState = {
  booksById: {},
};
