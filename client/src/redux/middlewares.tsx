import { EVENTS } from "domain/messages";
import { Middleware } from "redux";
import { container } from "../ServicesContainer";
import { Actions } from "../store/actions";

export const StoreActionsToMessageBusEvents: Middleware = (api) => (next) => (action) => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", api.getState());

  switch (action.type) {
    case `${Actions.FETCH_FEATURED_BOOKS}_FULFILLED`:
    case `${Actions.FETCH_BOOKS_FOR_GENRE}_FULFILLED`:
    case `${Actions.FETCH_BOOKS_FOR_AUTHOR}_FULFILLED`:
    case `${Actions.FETCH_BOOK_WITH_GENRE_STATS}_FULFILLED`:
      container.messageBus.emit(EVENTS.BOOK_DATA_FETCHED);
  }

  return result;
};
