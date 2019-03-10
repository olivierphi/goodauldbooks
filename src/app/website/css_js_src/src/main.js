import "./scss/main.scss";
import Barba from "barba.js/src"

window.addEventListener("load", () => {
  Barba.Pjax.Dom.wrapperId = "container";
  Barba.Pjax.start();
  Barba.Prefetch.init();
});
