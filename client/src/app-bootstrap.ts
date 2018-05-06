import axios from "axios";
import { AppConfig } from "./app-config";

export async function bootApp() {
  axios.defaults.baseURL = AppConfig.apiBaseURL;
}
