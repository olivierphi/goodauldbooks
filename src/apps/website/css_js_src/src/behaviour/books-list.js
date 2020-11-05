import Turbolinks from "turbolinks";

export function initBooksListBehaviour() {
  document.addEventListener("click", onDocumentClick);
}

function onDocumentClick(event) {
  const clickedNode = event.target;

  if (clickedNode.tagName === "A") {
    return;
  }

  const parentBookListItem = clickedNode.closest(".books-list .book");

  if (!parentBookListItem) {
    return;
  }

  const childLink = parentBookListItem.querySelector("a");
  const targetUrl = childLink.getAttribute("href");
  Turbolinks.visit(targetUrl);
}
