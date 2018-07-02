import * as React from "react";
import { storeActionsDispatcher } from "../../ActionsDispatcher";
import { BookFull as BookFullComponent } from "../../components/Book/BookFull";
import { BooksLangContext } from "../../contexts/books-lang";
import { BookFull, GenreWithStats, GenreWithStatsByName, Lang } from "../../domain/core";
import { EVENTS } from "../../domain/messages";
import { servicesLocator } from "../../ServicesLocator";
import {
  appStateHasGenresWithStats,
  getFullBookDataFromState,
  getGenresWithStatsFromState,
} from "../../utils/app-state-utils";

interface BookFullContainerProps {
  bookId: string;
}

interface BookFullContainerState {
  loading: false;
  bookFull: BookFull;
}

interface BookFullContainerLoadingState {
  loading: true;
}

export class BookFullContainer extends React.Component<
  BookFullContainerProps,
  BookFullContainerState | BookFullContainerLoadingState
> {
  constructor(props: BookFullContainerProps) {
    super(props);
    this.state = this.getDerivedStateFromPropsAndAppState();
    this.onBookDataFetched = this.onBookDataFetched.bind(this);
  }

  public render() {
    if (this.state.loading) {
      this.fetchData();
      return <div className="loading">Loading full book...</div>;
    }

    const bookFull: BookFull = this.state.bookFull;
    const appState = servicesLocator.appStateStore.getState();

    const genresWithStats = this.getSortedGenresWithStats(
      bookFull.genres,
      appState.genresWithStats
    );

    return (
      <BooksLangContext.Consumer>
        {(currentBooksLang: Lang) => (
          <BookFullComponent
            book={bookFull}
            genresWithStats={genresWithStats}
            currentBooksLang={currentBooksLang}
          />
        )}
      </BooksLangContext.Consumer>
    );
  }

  private fetchData(): void {
    servicesLocator.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    storeActionsDispatcher.fetchBookWithGenreStats(this.props.bookId);
  }

  private onBookDataFetched(): void {
    const newState = this.getDerivedStateFromPropsAndAppState();
    if (!newState.loading) {
      // We now have our full book data!
      // --> Let's update our state (and re-render), and stop listening to that BOOK_DATA_FETCHED event
      servicesLocator.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState():
    | BookFullContainerState
    | BookFullContainerLoadingState {
    const appState = servicesLocator.appStateStore.getState();
    const book = appState.booksById[this.props.bookId];

    if (!book || !appState.booksAssetsSize[this.props.bookId]) {
      return { loading: true };
    }
    if (!appStateHasGenresWithStats(book.genres, appState.genresWithStats)) {
      return { loading: true };
    }

    const bookFull: BookFull = getFullBookDataFromState(
      this.props.bookId,
      appState.booksById,
      appState.booksAssetsSize
    );

    return {
      loading: false,
      bookFull,
    };
  }

  private getSortedGenresWithStats(
    bookGenres: string[],
    genresWithStatsByName: GenreWithStatsByName
  ): GenreWithStats[] {
    const genresWithStats: GenreWithStats[] = getGenresWithStatsFromState(
      bookGenres,
      genresWithStatsByName
    );

    genresWithStats.sort(
      (genreA: GenreWithStats, genreB: GenreWithStats): number => {
        if (genreA.nbBooks > genreB.nbBooks) {
          return -1;
        }
        if (genreA.nbBooks < genreB.nbBooks) {
          return 1;
        }
        return 0;
      }
    );

    return genresWithStats;
  }
}
