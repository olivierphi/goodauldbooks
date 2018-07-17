import * as React from "react";
import { BooksByGenre } from "../../components/Book/BooksByGenre";
import { BooksById, Lang } from "../../domain/core";
import { ACTIONS, EVENTS } from "../../domain/messages";
import { PaginationRequestData, PaginationResponseData } from "../../domain/queries";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import {
  getPaginatedBooksIdsResultsFromCache,
  getPaginationResponseDataFromPaginationRequest,
} from "../../utils/pagination-utils";
import { getGenrePageUrl } from "../../utils/routing-utils";
import { HigherOrderComponentToolkit } from "../HigherOrderComponentToolkit";

interface BooksByGenreContainerProps {
  genre: string;
  pagination: PaginationRequestData;
  currentBooksLang: Lang;
  hocToolkit: HigherOrderComponentToolkit;
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
      <BooksByGenre
        genre={this.props.genre}
        currentBooksLang={this.props.currentBooksLang}
        paginationResponseData={this.state.paginationResponseData}
        genreBooks={this.state.genreBooks}
        navigateToPageNum={this.navigateToPageNum}
      />
    );
  }

  private navigateToPageNum(pageNum: number): void {
    const baseUrlWithoutPagination = getGenrePageUrl(
      this.props.hocToolkit.appStateStore.getState().booksLang,
      this.props.genre
    );

    const targetUrl = `${baseUrlWithoutPagination}?page=${pageNum}`;
    this.props.hocToolkit.messageBus.emit(ACTIONS.PUSH_URL, targetUrl);
  }

  private fetchData(): void {
    this.props.hocToolkit.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    this.props.hocToolkit.actionsDispatcher.fetchBooksForGenre(
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
      this.props.hocToolkit.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState():
    | BooksByGenreContainerState
    | BooksByGenreContainerLoadingState {
    const appState = this.props.hocToolkit.appStateStore.getState();
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
    const genreBooksMetadata = appState.booksIdsByGenre[criteriaName];
    const paginationResponseData: PaginationResponseData = getPaginationResponseDataFromPaginationRequest(
      this.props.pagination,
      genreBooksMetadata.totalCount,
      genreBooksMetadata.totalCountForAllLangs
    );

    return {
      loading: false,
      genreBooks,
      paginationResponseData,
    };
  }
}
