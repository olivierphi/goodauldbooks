import * as React from "react";
import { Redirect } from "react-router";
import { Async, Option, Options } from "react-select";

interface AutocompleteSearchProps {
  searchFunction: (input: string) => Promise<AsyncOptionsResult>;
}

interface AutocompleteSearchState {
  selectedBookId: string | null;
  selectedBookTitle: string | null;
}

export interface AsyncOptionsResult {
  options: Option[];
  complete?: boolean;
}

export class AutocompleteSearch extends React.Component<
  AutocompleteSearchProps,
  AutocompleteSearchState
> {
  private static emptyState = {
    selectedBookId: null,
    selectedBookTitle: null,
  };
  private static noOpFilterFunction = (options: Options): Options => {
    return options;
  }

  constructor(props: AutocompleteSearchProps) {
    super(props);
    this.state = AutocompleteSearch.emptyState;
    this.handleChange = this.handleChange.bind(this);
  }

  public render() {
    if (this.state.selectedBookTitle) {
      setTimeout(() => {
        this.setState(AutocompleteSearch.emptyState);
      }, 0);
      return <Redirect to={`/books/${this.state.selectedBookId}`} push={true} />;
    }

    return (
      <Async
        name="form-field-name"
        autoload={false}
        multi={false}
        autoFocus={true}
        value={this.state.selectedBookTitle || ""}
        onSelectResetsInput={false}
        loadOptions={this.props.searchFunction}
        filterOptions={AutocompleteSearch.noOpFilterFunction}
        onChange={this.handleChange}
      />
    );
  }

  public handleChange(selectedOption: Option): void {
    this.setState({
      selectedBookId: selectedOption.value ? selectedOption.value.toString() : null,
      selectedBookTitle: selectedOption.label ? selectedOption.label.toString() : null,
    });
  }
}
