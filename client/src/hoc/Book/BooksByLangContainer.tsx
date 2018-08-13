import * as React from "react";
import { BooksByLang } from "../../components/Book/BooksByLang";
import { BooksById, Lang } from "../../domain/core";
import { ACTIONS, EVENTS } from "../../domain/messages";
import { Page } from "../../domain/pages";
import { PaginationRequestData, PaginationResponseData } from "../../domain/queries";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import {
  getPaginatedBooksIdsResultsFromCache,
  getPaginationResponseDataFromPaginationRequest,
} from "../../utils/pagination-utils";
import { getBooksByLangPageUrl } from "../../utils/routing-utils";
import { HigherOrderComponentToolkit } from "../HigherOrderComponentToolkit";

interface BooksByLangContainerProps {
  currentBooksLang: Lang;
  pagination: PaginationRequestData;
  hocToolkit: HigherOrderComponentToolkit;
}

interface BooksByLangContainerState {
  loading: false;
  langBooks: BooksById;
  paginationResponseData: PaginationResponseData;
}

interface BooksByLangContainerLoadingState {
  loading: true;
}

type BooksByLangContainerPossibleState =
  | BooksByLangContainerState
  | BooksByLangContainerLoadingState;

export class BooksByLangContainer extends React.Component<
  BooksByLangContainerProps,
  BooksByLangContainerPossibleState
> {
  constructor(props: BooksByLangContainerProps) {
    super(props);
    this.state = this.getDerivedStateFromPropsAndAppState();
    this.onBookDataFetched = this.onBookDataFetched.bind(this);
    this.navigateToPageNum = this.navigateToPageNum.bind(this);
  }

  public componentDidUpdate(prevProps: BooksByLangContainerProps): void {
    if (
      prevProps.currentBooksLang !== this.props.currentBooksLang ||
      prevProps.pagination.page !== this.props.pagination.page
    ) {
      const newState = this.getDerivedStateFromPropsAndAppState();
      this.setState(newState);
    }
  }

  public render() {
    if (this.state.loading) {
      this.fetchData();
      return <div className="loading">Loading books for this language...</div>;
    }

    const langBooksArray = Object.values(this.state.langBooks);
    if (langBooksArray.length) {
      this.props.hocToolkit.setBreadcrumb({ currentPage: Page.LANG });
    }

    return (
      <BooksByLang
        lang={this.props.currentBooksLang}
        langBooks={this.state.langBooks}
        paginationResponseData={this.state.paginationResponseData}
        navigateToPageNum={this.navigateToPageNum}
      />
    );
  }

  private navigateToPageNum(pageNum: number): void {
    if (this.state.loading) {
      return;
    }
    const langBooks = Object.values(this.state.langBooks);
    const hasBooks = langBooks.length > 0;
    if (!hasBooks) {
      return;
    }

    const targetUrl = getBooksByLangPageUrl(
      this.props.hocToolkit.appStateStore.getState().booksLang,
      pageNum
    );

    this.props.hocToolkit.messageBus.emit(ACTIONS.PUSH_URL, targetUrl);
  }

  private fetchData(): void {
    this.props.hocToolkit.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    this.props.hocToolkit.actionsDispatcher.setBooksLang(this.props.currentBooksLang);
    this.props.hocToolkit.actionsDispatcher.fetchBooksForLang(
      this.props.currentBooksLang,
      this.props.pagination
    );
  }

  private onBookDataFetched(): void {
    const newState = this.getDerivedStateFromPropsAndAppState();
    if (!newState.loading) {
      // We now have our author books data for the requested page!
      // --> Let's update our state (and re-render), and stop listening to that BOOK_DATA_FETCHED event
      this.props.hocToolkit.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState(): BooksByLangContainerPossibleState {
    const appState = this.props.hocToolkit.appStateStore.getState();
    const criteriaName = `${this.props.currentBooksLang}`;
    const booksIdsByLang = getPaginatedBooksIdsResultsFromCache(
      appState.booksIdsByLang,
      criteriaName,
      this.props.pagination
    );

    if (!booksIdsByLang) {
      return { loading: true };
    }

    const langBooks = getBooksByIdsFromState(booksIdsByLang, appState.booksById);
    const langBooksMetadata = appState.booksIdsByLang[criteriaName];
    const paginationResponseData: PaginationResponseData = getPaginationResponseDataFromPaginationRequest(
      this.props.pagination,
      langBooksMetadata.totalCount,
      langBooksMetadata.totalCountForAllLangs
    );

    return {
      loading: false,
      langBooks,
      paginationResponseData,
    };
  }
}
