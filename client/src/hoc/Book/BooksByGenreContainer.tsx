import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { Action } from "redux";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, BooksIdsByGenre } from "../../domain/core";
import { AppState } from "../../store";
import { fetchBooksForGenre } from "../../store/actions";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";

const mapStateToProps = (state: AppState) => {
  return {
    allBooks: state.booksById,
    booksIdsByGenre: state.booksIdsByGenre,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBooksForGenre: (genre: string) => {
      dispatch(fetchBooksForGenre(genre));
    },
  };
};

interface BooksListHOCProps {
  genre: string;
  allBooks: BooksById;
  booksIdsByGenre: BooksIdsByGenre;
  fetchBooksForGenre: (genre: string) => void;
}

const BooksListHOC = (props: BooksListHOCProps) => {
  if (!props.booksIdsByGenre[props.genre]) {
    props.fetchBooksForGenre(props.genre);
    return <div className="loading">Loading books for this genre...</div>;
  }

  const booksToDisplay = getBooksByIdsFromState(props.booksIdsByGenre[props.genre], props.allBooks);

  return <BooksList books={booksToDisplay} />;
};

export const BooksByGenreContainer = connect(mapStateToProps, mapDispatchToProps)(BooksListHOC);
