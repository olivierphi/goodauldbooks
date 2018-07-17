import * as React from "react";
import { BookFull as BookFullComponent } from "../../components/Book/BookFull";
import { BooksLangContext } from "../../contexts/books-lang";
import { BookFull, GenreWithStats, GenreWithStatsByName, Lang } from "../../domain/core";
import { EVENTS } from "../../domain/messages";
import {
  appStateHasGenresWithStats,
  getFullBookDataFromState,
  getGenresWithStatsFromState,
} from "../../utils/app-state-utils";
import { HigherOrderComponentToolkit } from "../HigherOrderComponentToolkit";

interface BookFullContainerProps {
  bookId: string;
  hocToolkit: HigherOrderComponentToolkit;
}

interface BookFullContainerReadyState {
  loading: false;
  bookFull: BookFull;
}

interface BookFullContainerLoadingState {
  loading: true;
}

type BookFullContainerPossibleState = BookFullContainerReadyState | BookFullContainerLoadingState;

export class BookFullContainer extends React.Component<
  BookFullContainerProps,
  BookFullContainerPossibleState
> {
  constructor(props: BookFullContainerProps) {
    super(props);
    this.state = this.getDerivedStateFromPropsAndAppState();
    this.onBookDataFetched = this.onBookDataFetched.bind(this);
  }

  public render() {
    const loading: boolean = this.state.loading || this.props.bookId !== this.state.bookFull.id;
    if (loading) {
      // We either don't have any book in our state yet,
      // or that's not the one we want to render (likely because the user navigated to another book).
      // --> let's fetch the wanted book data!
      this.fetchData();
      return <div className="loading">Loading full book...</div>;
    }

    const state = this.state as BookFullContainerReadyState;
    const bookFull: BookFull = state.bookFull;
    const appState = this.props.hocToolkit.appStateStore.getState();

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

  public componentWillUnmount(): void {
    this.props.hocToolkit.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
  }

  private fetchData(): void {
    this.props.hocToolkit.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
    this.props.hocToolkit.actionsDispatcher.fetchBookWithGenreStats(this.props.bookId);
  }

  private onBookDataFetched(): void {
    const newState = this.getDerivedStateFromPropsAndAppState();
    if (!newState.loading) {
      // We now have our full book data!
      // --> Let's update our state (and re-render), and stop listening to that BOOK_DATA_FETCHED event
      this.props.hocToolkit.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromPropsAndAppState(): BookFullContainerPossibleState {
    const appState = this.props.hocToolkit.appStateStore.getState();
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
