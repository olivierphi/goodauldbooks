import * as React from "react";
import { Link } from "react-router-dom";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, Lang, LANG_ALL } from "../../domain/core";
import { ACTIONS, EVENTS } from "../../domain/messages";
import { PaginationRequestData, PaginationResponseData } from "../../domain/queries";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import {
  getPaginatedBooksIdsResultsFromCache,
  getPaginationResponseDataFromPaginationRequest,
} from "../../utils/pagination-utils";
import { getAuthorPageUrl } from "../../utils/routing-utils";
import { HigherOrderComponentToolkit } from "../HigherOrderComponentToolkit";

interface BooksByAuthorContainerProps {
  authorId: string;
  authorSlug: string;
  pagination: PaginationRequestData;
  currentBooksLang: Lang;
  hocToolkit: HigherOrderComponentToolkit;
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

    // TODO: i18n
    return (
      <>
        <h4>
          {this.state.paginationResponseData.nbResultsTotal} books for this author in this language
          ({this.props.currentBooksLang})
        </h4>
        {this.props.currentBooksLang === LANG_ALL ? (
          ""
        ) : (
          <Link to={this.getAuthorBooksPageUrlForAllLanguages()}>
            ({this.state.paginationResponseData.nbResultsTotalForAllLangs} for all languages)
          </Link>
        )}
        <BooksList
          books={this.state.authorBooks}
          pagination={this.state.paginationResponseData}
          navigateToPageNum={this.navigateToPageNum}
        />
      </>
    );
  }

  private navigateToPageNum(pageNum: number): void {
    if (this.state.loading) {
      return;
    }
    const authorBooks = Object.values(this.state.authorBooks);
    const hasBooks = authorBooks.length > 0;
    if (!hasBooks) {
      return;
    }

    const targetUrl = getAuthorPageUrl(
      this.props.hocToolkit.appStateStore.getState().booksLang,
      this.props.authorSlug,
      this.props.authorId,
      pageNum
    );

    this.props.hocToolkit.messageBus.emit(ACTIONS.PUSH_URL, targetUrl);
  }

  private getAuthorBooksPageUrlForAllLanguages(): string {
    return getAuthorPageUrl(LANG_ALL, this.props.authorSlug, this.props.authorId);
  }

  private fetchData(): void {
    this.props.hocToolkit.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    this.props.hocToolkit.actionsDispatcher.fetchBooksForAuthor(
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
      this.props.hocToolkit.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState():
    | BooksByAuthorContainerState
    | BooksByAuthorContainerLoadingState {
    const appState = this.props.hocToolkit.appStateStore.getState();
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
    const authorBooksMetadata = appState.booksIdsByAuthor[criteriaName];
    const paginationResponseData: PaginationResponseData = getPaginationResponseDataFromPaginationRequest(
      this.props.pagination,
      authorBooksMetadata.nbResultsTotal,
      authorBooksMetadata.nbResultsTotalForAllLangs
    );

    return {
      loading: false,
      authorBooks,
      paginationResponseData,
    };
  }
}
