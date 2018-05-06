import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { Action } from "redux";
import { BooksList, BooksListProps } from "../../components/Book/BooksList";
import { BooksById } from "../../domain/core";
import { PaginationRequestData } from "../../domain/queries";
import { AppState } from "../../store";
import { fetchFeaturedBooksList } from "../../store/actions";

const mapStateToProps = (state: AppState) => {
  return {
    allBooks: state.booksById,
    featuredBooksIds: state.featuredBooksIds,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchFeaturedBooksList: () => {
      dispatch(fetchFeaturedBooksList());
    },
  };
};

interface BooksListHOCProps {
  allBooks: BooksById;
  featuredBooksIds: string[];
  fetchFeaturedBooksList: () => void;
}

const BooksListHOC = (props: BooksListHOCProps) => {
  if (props.featuredBooksIds.length === 0) {
    props.fetchFeaturedBooksList();
    return <div className="loading">Loading books...</div>;
  }

  const booksToDisplay: BooksById = {};
  for (const bookId of props.featuredBooksIds) {
    booksToDisplay[bookId] = props.allBooks[bookId];
  }

  return <BooksList books={booksToDisplay} />;
};

export const FeaturedBooksContainer = connect(mapStateToProps, mapDispatchToProps)(BooksListHOC);
