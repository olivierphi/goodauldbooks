import { Lang } from "domain/core";
import { PaginationRequestData } from "domain/queries";
import { Action } from "redux";
import { ActionsDispatcher } from "./domain/app-state";
import { servicesLocator } from "./ServicesLocator";
import * as actions from "./store/actions";

class ActionsDispatcherImpl implements ActionsDispatcher {
  public fetchFeaturedBooksList(lang: Lang): void {
    this.dispatchToAppStateStore(actions.fetchFeaturedBooks(lang));
  }
  public setBooksLang(lang: Lang): void {
    this.dispatchToAppStateStore(actions.setCurrentBooksLang(lang));
  }

  public fetchBookWithGenreStats(bookId: string): void {
    this.dispatchToAppStateStore(actions.fetchBookWithGenreStats(bookId));
  }

  public fetchBooksForAuthor(
    authorId: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): void {
    this.dispatchToAppStateStore(actions.fetchBooksForAuthor(authorId, lang, pagination));
  }

  public fetchBooksForGenre(genre: string, lang: Lang, pagination: PaginationRequestData): void {
    this.dispatchToAppStateStore(actions.fetchBooksForGenre(genre, lang, pagination));
  }

  private dispatchToAppStateStore(action: Action): void {
    servicesLocator.appStateStore.dispatch(action);
  }
}

export const storeActionsDispatcher: ActionsDispatcher = new ActionsDispatcherImpl();
