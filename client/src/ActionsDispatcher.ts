import { Lang } from "domain/core";
import { PaginationRequestData } from "domain/queries";
import * as EventEmitter from "eventemitter3";
import { Action, Store } from "redux";
import { ActionsDispatcher } from "./domain/app-state";
import { EVENTS } from "./domain/messages";
import { BooksRepository } from "./domain/queries";
import { AppState } from "./store";
import * as actions from "./store/actions";

export class ActionsDispatcherImpl implements ActionsDispatcher {
  constructor(
    private booksRepository: BooksRepository,
    private messageBus: EventEmitter,
    private appStateStore: Store<AppState>
  ) {}

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

  public fetchIntroForBook(bookId: string): void {
    // This one is a bit unusual (i.e. it's not a simple action dispatch to the Redux store).
    // This is because we don't store books intros in the Redux state.
    // (that's a lot of data to serialise if we want to do SSR at some point, for example)
    this.booksRepository.getBookIntro(bookId).then(
      (intro: string | null): void => {
        this.messageBus.emit(EVENTS.BOOK_INTRO_FETCHED, intro);
      }
    );
  }

  private dispatchToAppStateStore(action: Action): void {
    this.appStateStore.dispatch(action);
  }
}
