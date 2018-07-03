import { Lang } from "domain/core";
import { PaginationRequestData } from "domain/queries";
import { Action, Store } from "redux";
import { ActionsDispatcher } from "./domain/app-state";
import { BooksRepository } from "./domain/queries";
import { AppState } from "./store";
import * as actions from "./store/actions";

export class ActionsDispatcherImpl implements ActionsDispatcher {
  constructor(private booksRepository: BooksRepository, private appStateStore: Store<AppState>) {}

  public fetchFeaturedBooksList(lang: Lang): void {
    this.dispatchToAppStateStore(actions.fetchFeaturedBooks(this.booksRepository, lang));
  }
  public setBooksLang(lang: Lang): void {
    this.dispatchToAppStateStore(actions.setCurrentBooksLang(lang));
  }

  public fetchBookWithGenreStats(bookId: string): void {
    this.dispatchToAppStateStore(actions.fetchBookWithGenreStats(this.booksRepository, bookId));
  }

  public fetchBooksForAuthor(
    authorId: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): void {
    this.dispatchToAppStateStore(
      actions.fetchBooksForAuthor(this.booksRepository, authorId, lang, pagination)
    );
  }

  public fetchBooksForGenre(genre: string, lang: Lang, pagination: PaginationRequestData): void {
    this.dispatchToAppStateStore(
      actions.fetchBooksForGenre(this.booksRepository, genre, lang, pagination)
    );
  }

  private dispatchToAppStateStore(action: Action): void {
    this.appStateStore.dispatch(action);
  }
}
