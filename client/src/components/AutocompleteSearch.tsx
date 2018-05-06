import * as React from "react";
import { Redirect } from "react-router";
import { Async, Option, OptionComponentProps, OptionComponentType, Options } from "react-select";

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
        placeholder="A book title or author name - i.e. 'Dracula', 'Mary Shelley'..."
        autoload={false}
        multi={false}
        autoFocus={true}
        value={this.state.selectedBookTitle || ""}
        onSelectResetsInput={false}
        loadOptions={this.props.searchFunction}
        filterOptions={AutocompleteSearch.noOpFilterFunction}
        optionComponent={AutocompleteOption}
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

class AutocompleteOption extends React.Component<OptionComponentProps> {
  constructor(props: OptionComponentProps) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  public render() {
    if (!this.props.option.label) {
      return "[Unknown book]";
    }
    // I would have liked to pass Book objects as values, but "@types/react-select" is hard-coded with strings as values
    // and therefore is not very happy with that... :-/
    // So, let's use the good ol' tricks with ugly separators as a lightweight serialisation!
    const [bookTitle, authorFirstName, authorLastName] = this.props.option.label
      .toString()
      .split("|");

    return (
      <div
        className={this.props.className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
      >
        <span className="book-title">{bookTitle}</span>
        <span className="author-name">
          {authorFirstName} {authorLastName}
        </span>
      </div>
    );
  }

  private handleMouseDown(event: React.SyntheticEvent<{}>) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.props.onSelect) {
      return;
    }
    this.props.onSelect(this.props.option, event);
  }

  private handleMouseEnter(event: React.SyntheticEvent<{}>) {
    if (!this.props.onFocus) {
      return;
    }
    this.props.onFocus(this.props.option, event);
  }

  private handleMouseMove(event: React.SyntheticEvent<{}>) {
    if (this.props.isFocused) {
      return;
    }
    if (!this.props.onFocus) {
      return;
    }
    this.props.onFocus(this.props.option, event);
  }
}
