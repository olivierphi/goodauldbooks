import { Store } from "react-redux";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import promiseMiddleware from "redux-promise-middleware";
import { AppState } from "./store";
import * as reducers from "./store/reducers";

export function initStore(): Store<AppState> {
  const booksApp = combineReducers(reducers);

  const windowRef: any = window || null;
  const composeEnhancers: any =
    typeof windowRef === "object" &&
    windowRef.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? windowRef.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const store = createStore(
    booksApp,
    composeEnhancers(applyMiddleware(promiseMiddleware()))
  ) as Store<AppState>;

  return store;
}
