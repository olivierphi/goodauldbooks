import { EVENTS } from "domain/messages";
import * as EventEmitter from "eventemitter3";
import { History } from "history";
import { LANG_ALL } from "../domain/core";
import { getBooksLangFromLocation } from "../utils/url-utils";

export function initLangFromUrl(history: History, messageBus: EventEmitter) {
  const location = history.location;
  const lang = getBooksLangFromLocation(location) || LANG_ALL;
  messageBus.emit(EVENTS.BOOKS_LANG_CHANGED, lang);
}
