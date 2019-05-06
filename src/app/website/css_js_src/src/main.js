import "./scss/main.scss";
import Turbolinks from "turbolinks";

window.addEventListener("load", initApp);

function initApp() {
  initAjaxNav();
}

function initAjaxNav() {
  Turbolinks.start();
}
