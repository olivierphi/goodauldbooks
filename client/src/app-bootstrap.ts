import axios from "axios";
import { AppConfig } from "./app-config";
import { container } from "./ServicesContainer";

export async function bootApp() {
  axios.defaults.baseURL = AppConfig.apiBaseURL;

  await container.boot();
}
