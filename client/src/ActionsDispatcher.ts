import { Lang } from "domain/core";
import { Action } from "redux";
import { ActionsDispatcher } from "./domain/app-state";
import { container } from "./ServicesContainer";
import * as actions from "./store/actions";

class ActionsDispatcherImpl implements ActionsDispatcher {
  public setBooksLang(lang: Lang): void {
    this.dispatchToAppStateStore(actions.setCurrentBooksLang(lang));
  }

  public fetchBookWithGenreStats(bookId: string): void {
    this.dispatchToAppStateStore(actions.fetchBookWithGenreStats(bookId));
  }

  private dispatchToAppStateStore(action: Action): void {
    container.appStateStore.dispatch(action);
  }
}

export const storeActionsDispatcher: ActionsDispatcher = new ActionsDispatcherImpl();
