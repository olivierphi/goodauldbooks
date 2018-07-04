import * as EventEmitter from "eventemitter3";
import { History } from "history";
import { ACTIONS } from "../domain/messages";

function onPushUrl(history: History, targetUrl: string): void {
  history.push(targetUrl);
}

export function registerEventListener(history: History, messageBus: EventEmitter): void {
  messageBus.on(ACTIONS.PUSH_URL, onPushUrl.bind(null, history));
}
