import * as React from "react";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, Lang } from "../../domain/core";
import { ACTIONS, EVENTS } from "../../domain/messages";
import { PaginationRequestData, PaginationResponseData } from "../../domain/queries";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import { getPaginatedBooksIdsResultsFromCache } from "../../utils/pagination-utils";
import { getAuthorPageUrl } from "../../utils/routing-utils";
import { HigherOrderComponentToolbox } from "../HigherOrderComponentToolbox";

interface BooksByAuthorContainerProps {
  authorId: string;
  pagination: PaginationRequestData;
  currentBooksLang: Lang;
  hocToolbox: HigherOrderComponentToolbox;
}

interface BooksByAuthorContainerState {
  loading: false;
  authorBooks: BooksById;
  paginationResponseData: PaginationResponseData;
}

interface BooksByAuthorContainerLoadingState {
  loading: true;
}

export class BooksByAuthorContainer extends React.Component<
  BooksByAuthorContainerProps,
  BooksByAuthorContainerState | BooksByAuthorContainerLoadingState
> {
  constructor(props: BooksByAuthorContainerProps) {
    super(props);
    this.state = this.getDerivedStateFromPropsAndAppState();
    this.onBookDataFetched = this.onBookDataFetched.bind(this);
    this.navigateToPageNum = this.navigateToPageNum.bind(this);
  }

  public componentDidUpdate(prevProps: BooksByAuthorContainerProps): void {
    if (
      prevProps.currentBooksLang !== this.props.currentBooksLang ||
      prevProps.pagination.page !== this.props.pagination.page ||
      prevProps.authorId !== this.props.authorId
    ) {
      const newState = this.getDerivedStateFromPropsAndAppState();
      this.setState(newState);
    }
  }

  public render() {
    if (this.state.loading) {
      this.fetchData();
      return <div className="loading">Loading books for this author...</div>;
    }

    return (
      <BooksList
        books={this.state.authorBooks}
        pagination={this.state.paginationResponseData}
        navigateToPageNum={this.navigateToPageNum}
      />
    );
  }

  private navigateToPageNum(pageNum: number): void {
    if (this.state.loading) {
      return;
    }
    const authorSlug = this.state.authorBooks.length
      ? Object.values(this.state.authorBooks)[0].author.slug
      : null;
    const baseUrlWithoutPagination = authorSlug
      ? getAuthorPageUrl(authorSlug, this.props.authorId)
      : null;
    const targetUrl = `${baseUrlWithoutPagination}?page=${pageNum}`;
    this.props.hocToolbox.messageBus.emit(ACTIONS.PUSH_URL, targetUrl);
  }

  private fetchData(): void {
    this.props.hocToolbox.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    this.props.hocToolbox.actionsDispatcher.fetchBooksForAuthor(
      this.props.authorId,
      this.props.currentBooksLang,
      this.props.pagination
    );
  }

  private onBookDataFetched(): void {
    const newState = this.getDerivedStateFromPropsAndAppState();
    if (!newState.loading) {
      // We now have our author books data for the requested page!
      // --> Let's update our state (and re-render), and stop listening to that BOOK_DATA_FETCHED event
      this.props.hocToolbox.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState():
    | BooksByAuthorContainerState
    | BooksByAuthorContainerLoadingState {
    const appState = this.props.hocToolbox.appStateStore.getState();
    const criteriaName = `${this.props.authorId}-${this.props.currentBooksLang}`;
    const booksIdsByAuthor = getPaginatedBooksIdsResultsFromCache(
      appState.booksIdsByAuthor,
      criteriaName,
      this.props.pagination
    );

    if (!booksIdsByAuthor) {
      return { loading: true };
    }

    const authorBooks = getBooksByIdsFromState(booksIdsByAuthor, appState.booksById);
    const paginationResponseData: PaginationResponseData = {
      nbResultsTotal: appState.booksIdsByAuthor[criteriaName].nbResultsTotal,
      ...this.props.pagination,
    };

    return {
      loading: false,
      authorBooks,
      paginationResponseData,
    };
  }
}
