import "./scss/main.scss";
import Turbolinks from "turbolinks";
import { initBooksListBehaviour } from "./behaviour/books-list";

window.addEventListener("load", initApp);

function initApp() {
  initAjaxNav();
  initBooksListBehaviour();
}

function initAjaxNav() {
  Turbolinks.start();
}
