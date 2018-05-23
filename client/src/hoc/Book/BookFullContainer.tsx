import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { BookFull as BookFullComponent } from "../../components/Book/BookFull";
import { Book, BookFull, GenreWithStats, GenreWithStatsByName } from "../../domain/core";
import { fetchBookWithGenreStats } from "../../store/actions";
import { AppState } from "../../store/index";
import {
  appStateHasGenresWithStats,
  getFullBookDataFromState,
  getGenresWithStatsFromState,
} from "../../utils/app-state-utils";

const mapStateToProps = (props: AppState, ownProps: { bookId: string }) => {
  const book: Book | null = props.booksById[ownProps.bookId];
  return {
    appState: props,
    bookId: ownProps.bookId,
    book,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBookWithGenreStats: (bookId: string) => {
      dispatch(fetchBookWithGenreStats(bookId));
    },
  };
};

const getSortedGenresWithStats = (
  bookGenres: string[],
  genresWithStatsByName: GenreWithStatsByName
): GenreWithStats[] => {
  const genresWithStats: GenreWithStats[] = getGenresWithStatsFromState(
    bookGenres,
    genresWithStatsByName
  );
  genresWithStats.sort((genreA: GenreWithStats, genreB: GenreWithStats): number => {
    if (genreA.nbBooks > genreB.nbBooks) {
      return -1;
    }
    if (genreA.nbBooks < genreB.nbBooks) {
      return 1;
    }
    return 0;
  });

  return genresWithStats;
};

interface BookFullHOCProps {
  appState: AppState;
  bookId: string;
  book?: Book;
  fetchBookWithGenreStats: (bookId: string) => void;
}

const BookFullHOC = (props: BookFullHOCProps) => {
  if (!props.book) {
    props.fetchBookWithGenreStats(props.bookId);
    return <div className="loading">Loading full book...</div>;
  }
  if (!appStateHasGenresWithStats(props.book.genres, props.appState.genresWithStats)) {
    props.fetchBookWithGenreStats(props.bookId);
    return <div className="loading">Loading book genre stats...</div>;
  }

  const genresWithStats = getSortedGenresWithStats(
    props.book.genres,
    props.appState.genresWithStats
  );
  const bookFull: BookFull = getFullBookDataFromState(
    props.bookId,
    props.appState.booksById,
    props.appState.booksAssetsSize
  );

  return <BookFullComponent book={bookFull} genresWithStats={genresWithStats} />;
};

export const BookFullContainer = connect(mapStateToProps, mapDispatchToProps)(BookFullHOC);
