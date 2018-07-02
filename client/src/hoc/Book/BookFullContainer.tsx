import * as React from "react";
import { storeActionsDispatcher } from "../../ActionsDispatcher";
import { BookFull as BookFullComponent } from "../../components/Book/BookFull";
import { BooksLangContext } from "../../contexts/books-lang";
import { BookFull, GenreWithStats, GenreWithStatsByName, Lang } from "../../domain/core";
import { EVENTS } from "../../domain/messages";
import { container } from "../../ServicesContainer";
import {
  appStateHasGenresWithStats,
  getFullBookDataFromState,
  getGenresWithStatsFromState,
} from "../../utils/app-state-utils";

interface BookFullContainerProps {
  bookId: string;
}

interface BookFullContainerState {
  bookFull: BookFull | null;
}

export class BookFullContainer extends React.Component<
  BookFullContainerProps,
  BookFullContainerState
> {
  constructor(props: BookFullContainerProps) {
    super(props);
    this.onBookDataFetched = this.onBookDataFetched.bind(this);
    // this.state = this.getUpdatedState();
  }

  public render() {
    if (!this.state || !this.state.bookFull) {
      container.messageBus.on(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      storeActionsDispatcher.fetchBookWithGenreStats(this.props.bookId);
      return <div className="loading">Loading full book...</div>;
    }

    const bookFull: BookFull = this.state.bookFull;
    const appState = container.appStateStore.getState();

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

  private onBookDataFetched(): void {
    const newState = this.getDerivedStateFromAppState();
    if (newState.bookFull) {
      // We now have our full book data!
      // --> Let's update our state (and re-render), and stop listening to that BOOK_DATA_FETCHED event
      container.messageBus.off(EVENTS.BOOK_DATA_FETCHED, this.onBookDataFetched);
      this.setState(newState);
    }
  }

  private getDerivedStateFromAppState(): BookFullContainerState {
    const appState = container.appStateStore.getState();
    const book = appState.booksById[this.props.bookId];

    if (!book || !appState.booksAssetsSize[this.props.bookId]) {
      return { bookFull: null };
    }
    if (!appStateHasGenresWithStats(book.genres, appState.genresWithStats)) {
      return { bookFull: null };
    }

    const bookFull: BookFull = getFullBookDataFromState(
      this.props.bookId,
      appState.booksById,
      appState.booksAssetsSize
    );

    return {
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
