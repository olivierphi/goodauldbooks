import { Action } from "redux";
import { Book, BooksById } from "../domain/core";
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
    case `${Actions.FETCH_FEATURED_BOOKS}_FULFILLED`:
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

export function featuredBooksIds(state: string[] = [], action: Action): string[] {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_FEATURED_BOOKS}_FULFILLED`:
      actionRef = action as BooksFetchedAction;
      const payload = actionRef.payload;
      const featuredBooksIds = Object.keys(payload);
      return featuredBooksIds;
    default:
      return state;
  }
}
