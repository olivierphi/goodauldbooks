import * as EventEmitter from "eventemitter3";
import { History } from "history";
import { ACTIONS } from "../domain/messages";
import { container } from "../ServicesContainer";

function onPushUrl(history: History, targetUrl: string): void {
  history.push(targetUrl);
}

export function registerEventListener(messageBus: EventEmitter) {
  const history = container.history;
  messageBus.on(ACTIONS.PUSH_URL, onPushUrl.bind(null, history));
}
