import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { BookFull } from "../../components/Book/BookFull";
import { Book, GenreWithStats, GenreWithStatsByName } from "../../domain/core";
import { fetchBookWithGenreStats } from "../../store/actions";
import { AppState } from "../../store/index";
import {
  appStateHasGenresWithStats,
  getGenresWithStatsFromState,
} from "../../utils/app-state-utils";

const mapStateToProps = (props: AppState, ownProps: { bookId: string }) => {
  const book: Book | null = props.booksById[ownProps.bookId];
  return {
    allGenresWithStats: props.genresWithStats,
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
  allGenresWithStats: GenreWithStatsByName;
  bookId: string;
  book?: Book;
  fetchBookWithGenreStats: (bookId: string) => void;
}

const BookFullHOC = (props: BookFullHOCProps) => {
  if (!props.book) {
    props.fetchBookWithGenreStats(props.bookId);
    return <div className="loading">Loading full book...</div>;
  }
  if (!appStateHasGenresWithStats(props.book.genres, props.allGenresWithStats)) {
    props.fetchBookWithGenreStats(props.bookId);
    return <div className="loading">Loading book genre stats...</div>;
  }

  const genresWithStats = getSortedGenresWithStats(props.book.genres, props.allGenresWithStats);

  return <BookFull book={props.book} genresWithStats={genresWithStats} />;
};

export const BookFullContainer = connect(mapStateToProps, mapDispatchToProps)(BookFullHOC);
