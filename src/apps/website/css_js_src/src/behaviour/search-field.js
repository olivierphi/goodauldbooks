import autocomplete from "autocompleter";
import Turbolinks from "turbolinks";

export function initialiseSearchField() {
  const input = document.getElementById("search_field");

  autocomplete({
    input: input,
    debounceWaitMs: 200,
    fetch: async function(text, update) {
      const url = `/library/search?search=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const result = await response.json();
      const suggestions = result.data.map(getAutocompleterResultFromAjaxResult);
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
      const authorName = ajaxResult["author_name"]
        ? ` (${ajaxResult["author_name"]})`
        : "";
      return {
        label: `${ajaxResult["book_title"]} ${authorName}`,
        value: ajaxResult["book_url"],
        group: "Books",
      };
    case "author":
      return {
        label: ajaxResult["author_name"],
        value: ajaxResult["author_url"],
        group: "Authors",
      };
  }
}
