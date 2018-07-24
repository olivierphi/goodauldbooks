import * as EventEmitter from "eventemitter3";
import { History, Location } from "history";
import { Lang, LANG_ALL } from "../domain/core";
import { EVENTS } from "../domain/messages";
import { getBooksLangFromLocation } from "../utils/url-utils";

let currentLang: Lang = "";

function onHistoryEvent(messageBus: EventEmitter, location: Location): void {
  messageBus.emit(EVENTS.URL_CHANGED, location.pathname);

  const lang = getBooksLangFromLocation(location);
  if (!lang || lang === currentLang) {
    return; // don't dispatch a "new lang" event if it didn't changed
  }
  messageBus.emit(EVENTS.BOOKS_LANG_CHANGED, lang);
  currentLang = lang;
}

export function registerEventListener(history: History, messageBus: EventEmitter): void {
  currentLang = getBooksLangFromLocation(history.location) || LANG_ALL;
  history.listen(onHistoryEvent.bind(null, messageBus));
}
