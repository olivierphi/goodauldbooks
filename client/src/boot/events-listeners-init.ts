// tslint:disable: max-line-length
import { ServicesLocator } from "domain/services";
import { registerEventListener as registerGoToPageEventListener } from "../event-listeners/GoToPageEventListener";
import { registerEventListener as registerPushUrlEventListener } from "../event-listeners/PushUrlEventListener";
import { registerEventListener as registerBooksLangChangedEventListener } from "../event-listeners/RegisterBooksLangChangedEventListener";
import { registerEventListener as registerUrlChangedEventListener } from "../event-listeners/UrlChangedEventListener";

export function registerEventsListeners(servicesLocator: ServicesLocator): void {
  registerPushUrlEventListener(servicesLocator.history, servicesLocator.messageBus);
  registerUrlChangedEventListener(servicesLocator.history, servicesLocator.messageBus);
  registerBooksLangChangedEventListener(
    servicesLocator.messageBus,
    servicesLocator.actionsDispatcher
  );
  registerGoToPageEventListener(servicesLocator.messageBus);
}
