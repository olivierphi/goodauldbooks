import { Lang } from "domain/core";
import { EVENTS } from "domain/messages";
import * as EventEmitter from "eventemitter3";
import { ActionsDispatcher } from "../domain/app-state";

function onBooksLangChanged(storeActionsDispatcher: ActionsDispatcher, newLang: Lang): void {
  storeActionsDispatcher.setBooksLang(newLang);
}

export function registerEventListener(
  messageBus: EventEmitter,
  storeActionsDispatcher: ActionsDispatcher
): void {
  messageBus.on(EVENTS.BOOKS_LANG_CHANGED, onBooksLangChanged.bind(null, storeActionsDispatcher));
}
