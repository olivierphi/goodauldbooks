import * as React from "react";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, Lang } from "../../domain/core";
import { EVENTS } from "../../domain/messages";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import { HigherOrderComponentToolkit } from "../HigherOrderComponentToolkit";

interface FeaturedBooksContainerProps {
  currentBooksLang: Lang;
  hocToolkit: HigherOrderComponentToolkit;
}

interface FeaturedBooksContainerState {
  loading: false;
  featuredBooks: BooksById;
}
interface FeaturedBooksContainerLoadingState {
  loading: true;
}

export class FeaturedBooksContainer extends React.Component<
  FeaturedBooksContainerProps,
  FeaturedBooksContainerState | FeaturedBooksContainerLoadingState
> {
  constructor(props: FeaturedBooksContainerProps) {
    super(props);
    this.state = this.getDerivedStateFromPropsAndAppState();
    this.onBookDataFetched = this.onBookDataFetched.bind(this);
  }

  public render() {
    if (this.state.loading) {
      this.fetchData();
      return <div className="loading">Loading full book...</div>;
    }

    return (
      <BooksList books={this.state.featuredBooks} pagination={null} navigateToPageNum={null} />
    );
  }

  private fetchData(): void {
    this.props.hocToolkit.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    this.props.hocToolkit.actionsDispatcher.fetchFeaturedBooksList(this.props.currentBooksLang);
  }

  private onBookDataFetched(): void {
    const newState = this.getDerivedStateFromPropsAndAppState();
    if (!newState.loading) {
      // We now have our freatures books data for the given language!
      // --> Let's update our state (and re-render), and stop listening to that BOOK_DATA_FETCHED event
      this.props.hocToolkit.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState():
    | FeaturedBooksContainerState
    | FeaturedBooksContainerLoadingState {
    const appState = this.props.hocToolkit.appStateStore.getState();

    if (!appState.featuredBooksIds.length) {
      return { loading: true };
    }

    const featuredBooks = getBooksByIdsFromState(appState.featuredBooksIds, appState.booksById);

    return { loading: false, featuredBooks };
  }
}
