import * as React from "react";
import { Redirect } from "react-router";
import { Async, Option, OptionComponentProps, Options } from "react-select";
import { getAuthorPageUrl, getBookPageUrl } from "../utils/routing-utils";

interface AutocompleteSearchProps {
  searchFunction: (input: string) => Promise<AsyncOptionsResult>;
}

interface AutocompleteSearchState {
  selectedBookId: string | null;
  selectedAuthorId: string | null;
}

export interface AsyncOptionsResult {
  options: Option[];
  complete?: boolean;
}

export class AutocompleteSearch extends React.Component<
  AutocompleteSearchProps,
  AutocompleteSearchState
> {
  private static emptyState: AutocompleteSearchState = {
    selectedBookId: null,
    selectedAuthorId: null,
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
    if (this.state.selectedBookId) {
      this.resetValueOnNextTick();
      return <Redirect to={getBookPageUrl(this.state.selectedBookId)} push={true} />;
    }
    if (this.state.selectedAuthorId) {
      this.resetValueOnNextTick();
      return <Redirect to={getAuthorPageUrl(this.state.selectedAuthorId)} push={true} />;
    }

    return (
      <Async
        name="form-field-name"
        placeholder="A book title or author name - i.e. 'Dracula', 'Mary Shelley'..."
        autoload={false}
        multi={false}
        autoFocus={true}
        value=""
        onSelectResetsInput={false}
        loadOptions={this.props.searchFunction}
        filterOptions={AutocompleteSearch.noOpFilterFunction}
        optionComponent={AutocompleteOption}
        onChange={this.handleChange}
      />
    );
  }

  public handleChange(selectedOption: Option): void {
    const selectedOptionValue = selectedOption.value;
    if (!selectedOptionValue) {
      return;
    }
    let idRegexMatch: string[] | null;
    let newState: AutocompleteSearchState = AutocompleteSearch.emptyState;
    if ((idRegexMatch = selectedOptionValue.toString().match(/^book:(.+)$/))) {
      newState = {
        selectedBookId: idRegexMatch[1],
        selectedAuthorId: null,
      };
    } else if ((idRegexMatch = selectedOptionValue.toString().match(/^author:(.+)$/))) {
      newState = {
        selectedBookId: null,
        selectedAuthorId: idRegexMatch[1],
      };
    }
    this.setState(newState);
  }

  private resetValueOnNextTick() {
    setTimeout(() => {
      this.setState(AutocompleteSearch.emptyState);
    }, 0);
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
    let optionContent: JSX.Element;
    if (0 === this.props.option.label.indexOf("book|")) {
      // This search result is a book
      const [
        ,
        bookTitle,
        bookLang,
        authorFirstName,
        authorLastName,
      ] = this.props.option.label.toString().split("|");
      optionContent = (
        <BookResultOptionContent
          bookTitle={bookTitle}
          bookLang={bookLang}
          authorFirstName={authorFirstName}
          authorLastName={authorLastName}
        />
      );
    } else {
      // This search result is an author
      const [, authorFirstName, authorLastName] = this.props.option.label.toString().split("|");
      optionContent = (
        <AuthorResultOptionContent
          authorFirstName={authorFirstName}
          authorLastName={authorLastName}
        />
      );
    }

    return (
      <div
        className={this.props.className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
      >
        {optionContent}
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

interface BookResultOptionContentProps {
  bookTitle: string;
  bookLang: string;
  authorFirstName: string;
  authorLastName: string;
}
function BookResultOptionContent(props: BookResultOptionContentProps) {
  return (
    <div className={`book-result lang-${props.bookLang}`}>
      <span className="option-type book">Book:</span>
      {/* TODO; i18n :-) */}
      <span className="book-title">{props.bookTitle}</span>
      <span className="author-name">
        {props.authorFirstName} {props.authorLastName}
      </span>
    </div>
  );
}

interface AuthorResultOptionContentProps {
  authorFirstName: string;
  authorLastName: string;
}
function AuthorResultOptionContent(props: AuthorResultOptionContentProps) {
  return (
    <div className="author-result">
      <span className="option-type author">Author:</span>
      {/* TODO; i18n :-) */}
      <span className="author-name">
        {props.authorFirstName} {props.authorLastName}
      </span>
    </div>
  );
}
