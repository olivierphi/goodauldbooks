import { Lang } from "domain/core";
import * as React from "react";
import { connect } from "react-redux";
import { Option } from "react-select";
import { AsyncOptionsResult, AutocompleteSearch } from "../components/AutocompleteSearch";
import { QuickSearchResult } from "../domain/queries";
import { container } from "../ServicesContainer";
import { AppState } from "../store";

const booksRepository = container.booksRepository;

const mapStateToProps = (state: AppState) => {
  return {
    currentLang: state.booksLang,
  };
};

const searchFunction = async (currentLang: string, input: string): Promise<AsyncOptionsResult> => {
  if (input.length < 2) {
    return Promise.resolve({ options: [] });
  }

  const results = await booksRepository.quickSearch(input, currentLang);
  if (!results.length) {
    return { options: [], complete: true };
  }

  const options = results.map(
    (match: QuickSearchResult): Option => {
      // @see AutocompleteSearch component for the reason of these pretty ugly poor man serialisation
      return {
        value: JSON.stringify(match),
        label: "", // all we need to build the label is contained in the serialised value
      };
    }
  );

  return { options };
};

interface AutocompleteSearchContainerHOCProps {
  currentLang: Lang;
}

export function AutocompleteSearchContainerHOC(
  props: AutocompleteSearchContainerHOCProps
): JSX.Element {
  return (
    <AutocompleteSearch
      searchFunction={searchFunction.bind(null, props.currentLang)}
      currentLang={props.currentLang}
    />
  );
}

export const AutocompleteSearchContainer = connect(mapStateToProps)(AutocompleteSearchContainerHOC);
