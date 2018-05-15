import * as React from "react";
import { Option } from "react-select";
import { AsyncOptionsResult, AutocompleteSearch } from "../components/AutocompleteSearch";
import { QuickSearchResult } from "../domain/queries";
import { container } from "../ServicesContainer";

const booksRepository = container.booksRepository;

const searchFunction = async (input: string): Promise<AsyncOptionsResult> => {
  if (input.length < 2) {
    return Promise.resolve({ options: [] });
  }

  const results = await booksRepository.quickSearch(input);
  if (!results.length) {
    return { options: [], complete: true };
  }

  const options = results.map((match: QuickSearchResult): Option => {
    // @see AutocompleteSearch component for the reason of these pretty ugly poor man serialisation
    return {
      value: JSON.stringify(match),
      label: "", // all we need to build the label is contained in the serialised value
    };
  });

  return { options };
};

export function AutocompleteSearchContainer(): JSX.Element {
  return <AutocompleteSearch searchFunction={searchFunction} />;
}
