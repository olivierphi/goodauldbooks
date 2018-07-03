import * as EventEmitter from "eventemitter3";
import { Store } from "redux";
import { ACTIONS, GoToAuthorPageAction, GoToBookPageAction } from "../domain/messages";
import { AppState } from "../store";
import { getAuthorPageUrl, getBookPageUrl } from "../utils/routing-utils";

function onGoToBookPage(
  appStateStore: Store<AppState>,
  messageBus: EventEmitter,
  action: GoToBookPageAction
): void {
  const bookUrl = getBookPageUrl(
    appStateStore.getState().booksLang,
    action.bookLang,
    action.authorSlug,
    action.bookSlug,
    action.bookId
  );
  messageBus.emit(ACTIONS.PUSH_URL, bookUrl);
}

function onGoToAuthorPage(
  appStateStore: Store<AppState>,
  messageBus: EventEmitter,
  action: GoToAuthorPageAction
): void {
  const authorUrl = getAuthorPageUrl(
    appStateStore.getState().booksLang,
    action.authorSlug,
    action.authorId
  );
  messageBus.emit(ACTIONS.PUSH_URL, authorUrl);
}

export function registerEventListener(
  appStateStore: Store<AppState>,
  messageBus: EventEmitter
): void {
  messageBus.on(ACTIONS.GO_TO_BOOK_PAGE, onGoToBookPage.bind(null, appStateStore, messageBus));
  messageBus.on(ACTIONS.GO_TO_AUTHOR_PAGE, onGoToAuthorPage.bind(null, appStateStore, messageBus));
}
