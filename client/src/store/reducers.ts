import { Action } from "redux";
import { Book, BooksById } from "../domain/core";
import { AppState } from "../store";
import { Actions } from "./actions";

interface BooksFetchedAction extends Action {
  payload: BooksById;
}

interface BookFetchedAction extends Action {
  payload: Book;
}

export function booksById(
  state: BooksById = new Map(),
  action: Action
): BooksById {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_ALL_BOOKS}_FULFILLED`:
      actionRef = action as BooksFetchedAction;
      const payload = actionRef.payload;
      return new Map([
        ...Array.from(state.entries()),
        ...Array.from(payload.entries()),
      ]);
    case `${Actions.FETCH_BOOK}_FULFILLED`:
      actionRef = action as BookFetchedAction;
      return new Map([
        ...Array.from(state.entries()),
        [actionRef.payload.id, actionRef.payload],
      ]);
    default:
      return state;
  }
}
