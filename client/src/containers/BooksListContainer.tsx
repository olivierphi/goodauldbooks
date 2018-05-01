import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { Action } from "redux";
import { BooksList, BooksListProps } from "../components/BooksList";
import { CurrentLangContext } from "../contexts/lang";
import { PaginationRequestData } from "../domain/queries";
import { AppState } from "../store";
import { fetchPinnedBooksList } from "../store/actions";

const mapStateToProps = (state: AppState) => {
  return {
    books: state.booksById,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBooksList: () => {
      dispatch(fetchPinnedBooksList({ page: 1, nbPerPage: 10 }));
    },
  };
};

type BooksListHOCProps = BooksListProps & {
  fetchBooksList: (pagination: PaginationRequestData) => void;
};

const BooksListHOC = (props: BooksListHOCProps) => {
  if (Object.keys(props.books).length === 0) {
    props.fetchBooksList({ page: 1, nbPerPage: 10 });
    return <div className="loading">Loading books...</div>;
  }

  return <BooksList {...props} />;
};

export const BooksListContainer = connect(mapStateToProps, mapDispatchToProps)(BooksListHOC);
