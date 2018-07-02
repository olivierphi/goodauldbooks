import axios from "axios";
import { AppConfig } from "./app-config";
import { registerEventsListeners } from "./boot/events-listeners-init";
import { initLangFromUrl } from "./boot/init-lang-from-url";
import { container } from "./ServicesContainer";

export async function bootApp() {
  axios.defaults.baseURL = AppConfig.apiBaseURL;

  await container.boot();

  registerEventsListeners(container);

  initLangFromUrl(container.history, container.messageBus);
}
