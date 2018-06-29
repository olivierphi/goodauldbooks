import { registerEventListener as registerPushUrlEventListener } from "../event-listeners/PushUrlEventListener";
import { ServicesContainer } from "../ServicesContainer";

export function registerEventsListeners(container: ServicesContainer): void {
  registerPushUrlEventListener(container.messageBus);
}
