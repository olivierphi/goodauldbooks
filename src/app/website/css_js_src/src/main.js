import "./scss/main.scss";
import Barba from "barba.js/src";
import { initBooksListBehaviour } from "./behaviour/books-list";

window.addEventListener("load", initApp);

function initApp() {
  initAjaxNav();
  initBooksListBehaviour();
}

function initAjaxNav() {
  Barba.Pjax.Dom.wrapperId = "container";
  Barba.Pjax.start();
  Barba.Prefetch.init();
}
