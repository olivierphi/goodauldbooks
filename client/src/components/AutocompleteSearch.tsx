import * as React from "react";
import { Async, Option, OptionComponentProps, Options } from "react-select";
import { Lang } from "../domain/core";
import { QuickSearchResult } from "../domain/queries";

interface AutocompleteSearchProps {
  booksLang: Lang;
  searchFunction: (input: string, booksLang: Lang) => Promise<AsyncOptionsResult>;
  redirectToSelectedSearchResultPageFunction: (selectedSearchResult: QuickSearchResult) => void;
}

export interface AsyncOptionsResult {
  options: Option[];
  complete?: boolean;
}

export class AutocompleteSearch extends React.Component<AutocompleteSearchProps> {
  private static noOpFilterFunction = (options: Options): Options => {
    return options;
  };

  constructor(props: AutocompleteSearchProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.loadOptions = this.loadOptions.bind(this);
  }

  public render() {
    {
      /**
       * N.B.: Because this <select> input is not the only cache key we must consider for results
       * (the same input can have different results, depending on the current selected language),
       * we have to disable the internal cache of the Async select, and implement it ourself in the Books repository
       * if we want caching.
       *
       * TODO: i18n :-)
       */
    }
    return (
      <div className="autocomplete-search-container">
        <Async
          name="form-field-name"
          placeholder="A book title or author name - i.e. 'Dracula', 'Mary Shelley'..."
          autoload={false}
          multi={false}
          autoFocus={true}
          value=""
          onSelectResetsInput={false}
          loadOptions={this.loadOptions}
          filterOptions={AutocompleteSearch.noOpFilterFunction}
          optionComponent={AutocompleteOption}
          onChange={this.handleChange}
          cache={false}
        />
      </div>
    );
  }

  private loadOptions(input: string): Promise<AsyncOptionsResult> {
    return this.props.searchFunction(input, this.props.booksLang);
  }

  private handleChange(selectedOption: Option): void {
    const selectedOptionValue = selectedOption.value;
    if (!selectedOptionValue) {
      return;
    }
    const searchResult: QuickSearchResult = JSON.parse(selectedOptionValue as string);
    this.props.redirectToSelectedSearchResultPageFunction(searchResult);
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
    // I would have liked to pass Book objects as values, but "@types/react-select" is hard-coded with strings as values
    // and therefore is not very happy with that... :-/
    // This is why I have to serialise/unserialise the QuickSearchResults in JSON, which is far from being optimal...
    let optionContent: JSX.Element;
    const result: QuickSearchResult = JSON.parse(this.props.option.value as string);
    if (result.book) {
      optionContent = (
        <BookResultOptionContent
          bookTitle={result.book.title}
          bookLang={result.book.lang}
          authorFirstName={result.author.firstName}
          authorLastName={result.author.lastName}
        />
      );
    } else {
      optionContent = (
        <AuthorResultOptionContent
          authorFirstName={result.author.firstName}
          authorLastName={result.author.lastName}
          authorNbBooks={result.author.nbBooks}
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
  bookLang: Lang;
  authorFirstName: string;
  authorLastName: string;
}
function BookResultOptionContent(props: BookResultOptionContentProps) {
  return (
    <div className={`book-result lang-${props.bookLang}`}>
      <span className="option-type book">Book:</span>
      {/* TODO: i18n :-) */}
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
  authorNbBooks: number;
}
function AuthorResultOptionContent(props: AuthorResultOptionContentProps) {
  return (
    <div className="author-result">
      <span className="option-type author">Author:</span>
      {/* TODO: i18n :-) */}
      <span className="author-name">
        {props.authorFirstName} {props.authorLastName}
      </span>
      <span className="author-nb-books">{props.authorNbBooks} books</span>
    </div>
  );
}
