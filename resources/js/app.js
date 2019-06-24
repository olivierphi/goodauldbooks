import Turbolinks from "turbolinks";
import { initialiseSearchField } from "./behaviour/search-field";

window.addEventListener("load", initApp);

function initApp() {
  initAjaxNav();
  initialiseSearchField();
}

function initAjaxNav() {
  Turbolinks.start();
}
