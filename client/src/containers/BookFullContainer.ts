import { connect } from "react-redux";
import { Action } from "redux";
import { BookFull } from "../components/BookFull";
import { fetchBook } from "../store/actions";
import { AppState } from "../store/index";

const mapStateToProps = (props: AppState, ownProps: any) => {
  return {
    bookId: ownProps.bookId,
    book: props.booksById[ownProps.bookId],
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBook: (bookId: string) => {
      dispatch(fetchBook(bookId));
    },
  };
};

export const BookFullContainer = connect(mapStateToProps, mapDispatchToProps)(
  BookFull
);
