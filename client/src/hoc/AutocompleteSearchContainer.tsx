import * as React from "react";
import { Option } from "react-select";
import { AsyncOptionsResult, AutocompleteSearch } from "../components/AutocompleteSearch";
import { Author, Book } from "../domain/core";
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

  const options = results.map((match: Book | Author): Option => {
    let option: Option;
    // @see AutocompleteSearch component for the reason of these pretty ugly poor man serialisation
    if ("title" in match) {
      // This is a book :-)
      const book = match as Book;
      option = {
        value: `book:${book.id}`,
        label: ["book", book.title, book.lang, book.author.firstName, book.author.lastName].join(
          "|"
        ),
      };
    } else {
      // This is an author
      const author = match as Author;
      option = {
        value: `author:${author.id}`,
        label: ["author", author.firstName, author.lastName].join("|"),
      };
    }

    return option;
  });

  return { options };
};

export function AutocompleteSearchContainer(): JSX.Element {
  return <AutocompleteSearch searchFunction={searchFunction} />;
}
