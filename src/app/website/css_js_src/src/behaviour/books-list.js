import Barba from "barba.js/src";

export function initBooksListBehaviour() {
  document.addEventListener("click", onDocumentClick);
}

function onDocumentClick(event) {
  const clickedNode = event.target;
  const parentBookListItem = clickedNode.closest(".books-list .book");

  if (!parentBookListItem) {
    return;
  }

  const childLink = parentBookListItem.querySelector("a");
  const targetUrl = childLink.getAttribute("href");
  Barba.Pjax.goTo(targetUrl);

  /*
  // The following is not managed correctly by Barba's Pjax handler unfortunately :-/
  const eventToDispatch = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true
  });
  childLink.dispatchEvent(eventToDispatch);
   */
}
