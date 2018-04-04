import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { BookFull, BookFullProps } from "../components/BookFull";
import { fetchBook } from "../store/actions";
import { AppState } from "../store/index";

const mapStateToProps = (props: AppState, ownProps: { bookId: string }) => {
  return {
    bookId: ownProps.bookId,
    book: props.booksById.get(ownProps.bookId),
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBook: (bookId: string) => {
      dispatch(fetchBook(bookId));
    },
  };
};

type BookFullHOCProps = BookFullProps & { fetchBook: (bookId: string) => void };

const BookFullHOC = (props: BookFullHOCProps) => {
  if (!props.book) {
    props.fetchBook(props.bookId);
    return <div className="loading">Loading book...</div>;
  }

  return <BookFull {...props} />;
};

export const BookFullContainer = connect(mapStateToProps, mapDispatchToProps)(
  BookFullHOC
);
