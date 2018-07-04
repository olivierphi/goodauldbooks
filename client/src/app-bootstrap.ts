import axios from "axios";
import { AppConfig } from "./app-config";
import { registerEventsListeners } from "./boot/events-listeners-init";
import { initLangFromUrl } from "./boot/init-lang-from-url";
import { ServicesLocator } from "./domain/services";
import { ServicesLocatorImpl } from "./ServicesLocator";

export async function bootApp(): Promise<ServicesLocator> {
  const servicesLocator = new ServicesLocatorImpl();

  axios.defaults.baseURL = AppConfig.apiBaseURL;

  await servicesLocator.boot();

  registerEventsListeners(servicesLocator);

  initLangFromUrl(servicesLocator.history, servicesLocator.messageBus);

  return servicesLocator;
}
