import { applyMiddleware, combineReducers, compose, createStore, Middleware, Store } from "redux";
import promiseMiddleware from "redux-promise-middleware";
import { ServicesLocator } from "./domain/services";
import * as appMiddlewares from "./redux/middlewares";
import { AppState } from "./store";
import * as reducers from "./store/reducers";

export function initStore(servicesLocator: ServicesLocator): Store<AppState> {
  const booksApp = combineReducers(reducers);

  const windowRef: any = window || null;
  const composeEnhancers: any =
    typeof windowRef === "object" && windowRef.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? windowRef.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const middlewares: Middleware[] = [
    promiseMiddleware(),
    appMiddlewares.storeActionsToMessageBusEvents(servicesLocator),
  ];
  const store = createStore(
    booksApp,
    composeEnhancers(applyMiddleware.apply(null, middlewares))
  ) as Store<AppState>;

  return store;
}
