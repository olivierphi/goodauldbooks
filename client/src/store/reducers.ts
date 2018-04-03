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

export function booksById(state: BooksById = {}, action: Action): BooksById {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_ALL_BOOKS}_FULFILLED`:
      actionRef = action as BooksFetchedAction;
      const payload = actionRef.payload;
      return {
        ...state,
        ...payload,
      };
    case `${Actions.FETCH_BOOK}_FULFILLED`:
      actionRef = action as BookFetchedAction;
      return {
        ...state,
        ...{ [actionRef.payload.id]: actionRef.payload },
      };
    default:
      return state;
  }
}
