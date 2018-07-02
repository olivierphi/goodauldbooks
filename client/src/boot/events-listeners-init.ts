import { storeActionsDispatcher } from "../ActionsDispatcher";
import { registerEventListener as registerGoToPageEventListener } from "../event-listeners/GoToPageEventListener";
import { registerEventListener as registerPushUrlEventListener } from "../event-listeners/PushUrlEventListener";
import { registerEventListener as registerBooksLangChangedEventListener } from "../event-listeners/RegisterBooksLangChangedEventListener";
import { registerEventListener as registerUrlChangedEventListener } from "../event-listeners/UrlChangedEventListener";
import { ServicesContainer } from "../ServicesContainer";

export function registerEventsListeners(container: ServicesContainer): void {
  registerPushUrlEventListener(container.history, container.messageBus);
  registerUrlChangedEventListener(container.history, container.messageBus);
  registerBooksLangChangedEventListener(container.messageBus, storeActionsDispatcher);
  registerGoToPageEventListener(container.messageBus);
}
