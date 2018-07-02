import * as EventEmitter from "eventemitter3";
import { ACTIONS, GoToAuthorPageAction, GoToBookPageAction } from "../domain/messages";
import { getAuthorPageUrl, getBookPageUrl } from "../utils/routing-utils";

function onGoToBookPage(messageBus: EventEmitter, action: GoToBookPageAction): void {
  const bookUrl = getBookPageUrl(
    action.bookLang,
    action.authorSlug,
    action.bookSlug,
    action.bookId
  );
  messageBus.emit(ACTIONS.PUSH_URL, bookUrl);
}

function onGoToAuthorPage(messageBus: EventEmitter, action: GoToAuthorPageAction): void {
  const authorUrl = getAuthorPageUrl(action.authorSlug, action.authorId);
  messageBus.emit(ACTIONS.PUSH_URL, authorUrl);
}

export function registerEventListener(messageBus: EventEmitter): void {
  messageBus.on(ACTIONS.GO_TO_BOOK_PAGE, onGoToBookPage.bind(null, messageBus));
  messageBus.on(ACTIONS.GO_TO_AUTHOR_PAGE, onGoToAuthorPage.bind(null, messageBus));
}
