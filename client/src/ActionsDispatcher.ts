import { Action } from "redux";
import { container } from "./ServicesContainer";
import * as actions from "./store/actions";

/**
 * This class allows us to displatch domain actions with a proper Interface.
 * Such actions can be connected to Redux actions or to MessageBus message emitting.
 */
export interface ActionsDispatcher {
  fetchBookWithGenreStats(bookId: string): void;
}

class ActionsDispatcherImpl implements ActionsDispatcher {
  public fetchBookWithGenreStats(bookId: string): void {
    this.dispatchToAppStateStore(actions.fetchBookWithGenreStats(bookId));
  }

  private dispatchToAppStateStore(action: Action): void {
    container.appStateStore.dispatch(action);
  }
}

export const dispatcher: ActionsDispatcher = new ActionsDispatcherImpl();
