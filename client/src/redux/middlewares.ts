import { EVENTS } from "domain/messages";
import { Middleware } from "redux";
import { ServicesLocator } from "../domain/services";
import { Actions } from "../store/actions";

export const storeActionsToMessageBusEvents = (
  servicesLocator: ServicesLocator
): Middleware => (api) => (next) => (action) => {
  console.log("dispatching", action); // tslint:disable-line
  const result = next(action);
  console.log("next state", api.getState()); // tslint:disable-line

  switch (action.type) {
    case `${Actions.FETCH_FEATURED_BOOKS}_FULFILLED`:
    case `${Actions.FETCH_BOOKS_FOR_GENRE}_FULFILLED`:
    case `${Actions.FETCH_BOOKS_FOR_AUTHOR}_FULFILLED`:
    case `${Actions.FETCH_BOOK_WITH_GENRE_STATS}_FULFILLED`:
      servicesLocator.messageBus.emit(EVENTS.BOOK_DATA_FETCHED);
  }

  return result;
};
