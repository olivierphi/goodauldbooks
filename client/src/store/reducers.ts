import { Action } from "redux";
import { BooksById } from "../domain/core";
import { AppState } from "../store";
import { Actions } from "./actions";

interface BooksFetchedAction extends Action {
  payload: BooksById;
}

export function booksById(
  state: BooksById = {},
  action: BooksFetchedAction
): BooksById {
  switch (action.type) {
    case `${Actions.FETCH_ALL_BOOKS}_FULFILLED`:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
