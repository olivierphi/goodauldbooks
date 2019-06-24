import autocomplete from "autocompleter";
import Turbolinks from "turbolinks";

export function initialiseSearchField() {
  const input = document.getElementById("search_field");

  autocomplete({
    input: input,
    debounceWaitMs: 200,
    fetch: async function(text, update) {
      const url = `/api/library/autocompletion?pattern=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const result = await response.json();
      const suggestions = result.map(getAutocompleterResultFromAjaxResult);
      update(suggestions);
    },
    onSelect: function(item) {
      const itemUrl = item.value;
      input.value = "";
      Turbolinks.visit(itemUrl);
    },
  });
}

function getAutocompleterResultFromAjaxResult(ajaxResult) {
  switch (ajaxResult["type"]) {
    case "book":
      const authorName = ajaxResult["author_last_name"]
        ? ` (${getAuthorFirstName(ajaxResult)})`
        : "";
      return {
        label: `${ajaxResult["book_title"]} ${authorName}`,
        value: `/library/books/${ajaxResult["book_slug"]}`,
        group: "Books",
      };
    case "author":
      return {
        label: getAuthorFirstName(ajaxResult),
        value: `/library/authors/${ajaxResult["author_slug"]}`,
        group: "Authors",
      };
  }
}

function getAuthorFirstName(ajaxResult) {
  return [ajaxResult["author_first_name"], ajaxResult["author_last_name"]].join(" ");
}
