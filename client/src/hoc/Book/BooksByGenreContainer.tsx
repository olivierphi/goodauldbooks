import * as React from "react";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, Lang } from "../../domain/core";
import { ACTIONS, EVENTS } from "../../domain/messages";
import { PaginationRequestData, PaginationResponseData } from "../../domain/queries";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import { getPaginatedBooksIdsResultsFromCache } from "../../utils/pagination-utils";
import { getGenrePageUrl } from "../../utils/routing-utils";
import { HigherOrderComponentToolbox } from "../HigherOrderComponentToolbox";

interface BooksByGenreContainerProps {
  genre: string;
  pagination: PaginationRequestData;
  currentBooksLang: Lang;
  hocToolbox: HigherOrderComponentToolbox;
}

interface BooksByGenreContainerState {
  loading: false;
  genreBooks: BooksById;
  paginationResponseData: PaginationResponseData;
}

interface BooksByGenreContainerLoadingState {
  loading: true;
}

export class BooksByGenreContainer extends React.Component<
  BooksByGenreContainerProps,
  BooksByGenreContainerState | BooksByGenreContainerLoadingState
> {
  constructor(props: BooksByGenreContainerProps) {
    super(props);
    this.state = this.getDerivedStateFromPropsAndAppState();
    this.onBookDataFetched = this.onBookDataFetched.bind(this);
    this.navigateToPageNum = this.navigateToPageNum.bind(this);
  }

  public componentDidUpdate(prevProps: BooksByGenreContainerProps): void {
    if (
      prevProps.currentBooksLang !== this.props.currentBooksLang ||
      prevProps.pagination.page !== this.props.pagination.page ||
      prevProps.genre !== this.props.genre
    ) {
      const newState = this.getDerivedStateFromPropsAndAppState();
      this.setState(newState);
    }
  }

  public render() {
    if (this.state.loading) {
      this.fetchData();
      return <div className="loading">Loading books for this genre...</div>;
    }

    return (
      <BooksList
        books={this.state.genreBooks}
        pagination={this.state.paginationResponseData}
        navigateToPageNum={this.navigateToPageNum}
      />
    );
  }

  private navigateToPageNum(pageNum: number): void {
    const baseUrlWithoutPagination = getGenrePageUrl(this.props.genre);
    const targetUrl = `${baseUrlWithoutPagination}?page=${pageNum}`;
    this.props.hocToolbox.messageBus.emit(ACTIONS.PUSH_URL, targetUrl);
  }

  private fetchData(): void {
    this.props.hocToolbox.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    this.props.hocToolbox.actionsDispatcher.fetchBooksForGenre(
      this.props.genre,
      this.props.currentBooksLang,
      this.props.pagination
    );
  }

  private onBookDataFetched(): void {
    const newState = this.getDerivedStateFromPropsAndAppState();
    if (!newState.loading) {
      // We now have our genre books data for the requested page!
      // --> Let's update our state (and re-render), and stop listening to that BOOK_DATA_FETCHED event
      this.props.hocToolbox.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState():
    | BooksByGenreContainerState
    | BooksByGenreContainerLoadingState {
    const appState = this.props.hocToolbox.appStateStore.getState();
    const criteriaName = `${this.props.genre}-${this.props.currentBooksLang}`;
    const booksIdsByGenre = getPaginatedBooksIdsResultsFromCache(
      appState.booksIdsByGenre,
      criteriaName,
      this.props.pagination
    );

    if (!booksIdsByGenre) {
      return { loading: true };
    }

    const genreBooks = getBooksByIdsFromState(booksIdsByGenre, appState.booksById);
    const paginationResponseData: PaginationResponseData = {
      nbResultsTotal: appState.booksIdsByGenre[criteriaName].nbResultsTotal,
      ...this.props.pagination,
    };

    return {
      loading: false,
      genreBooks,
      paginationResponseData,
    };
  }
}
