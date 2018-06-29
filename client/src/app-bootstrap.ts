import axios from "axios";
import { AppConfig } from "./app-config";
import { registerEventsListeners } from "./boot/events-listeners-init";
import { container } from "./ServicesContainer";

export async function bootApp() {
  axios.defaults.baseURL = AppConfig.apiBaseURL;

  await container.boot();

  registerEventsListeners(container);
}
