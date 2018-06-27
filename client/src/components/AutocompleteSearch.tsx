import * as React from "react";
import { Redirect } from "react-router";
import { Async, Option, OptionComponentProps, Options } from "react-select";
import { QuickSearchResult } from "../domain/queries";
import { getAuthorPageUrl, getBookPageUrl } from "../utils/routing-utils";

interface AutocompleteSearchProps {
  currentLang: string;
  searchFunction: (input: string) => Promise<AsyncOptionsResult>;
}

interface AutocompleteSearchState {
  selectedResult: QuickSearchResult | null;
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
    selectedResult: null,
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
    if (this.state.selectedResult) {
      const selectedResult: QuickSearchResult = this.state.selectedResult;
      const author = selectedResult.author;

      if (selectedResult.book) {
        this.setState(AutocompleteSearch.emptyState);
        const book = selectedResult.book;
        const bookUrl = getBookPageUrl(book.lang, author.slug, book.slug, book.id);
        return <Redirect to={bookUrl} push={true} />;
      }
      if (author) {
        this.setState(AutocompleteSearch.emptyState);
        const authorUrl = getAuthorPageUrl(author.slug, author.id);
        return <Redirect to={authorUrl} push={true} />;
      }
    }

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
        cache={false}
      />
    );
  }

  public handleChange(selectedOption: Option): void {
    const selectedOptionValue = selectedOption.value;
    if (!selectedOptionValue) {
      return;
    }
    const searchResult: QuickSearchResult = JSON.parse(selectedOptionValue as string);
    this.setState({ selectedResult: searchResult });
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
  bookLang: string;
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
