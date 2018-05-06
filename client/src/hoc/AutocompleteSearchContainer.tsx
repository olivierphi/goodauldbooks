import * as React from "react";
import { Option } from "react-select";
import { AsyncOptionsResult, AutocompleteSearch } from "../components/AutocompleteSearch";
import { Book } from "../domain/core";
import { container } from "../ServicesContainer";

const booksRepository = container.booksRepository;

const searchFunction = async (input: string): Promise<AsyncOptionsResult> => {
  if (input.length < 2) {
    return Promise.resolve({ options: [] });
  }

  const books = await booksRepository.quickSearch(input);
  if (!books.length) {
    return { options: [], complete: true };
  }

  const options = books.map((matchingBook: Book): Option => {
    return {
      value: matchingBook.id,
      label: matchingBook.title,
    };
  });

  return { options };
};

export function AutocompleteSearchContainer(): JSX.Element {
  return <AutocompleteSearch searchFunction={searchFunction} />;
}
