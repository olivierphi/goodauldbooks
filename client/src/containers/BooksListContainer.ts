import { connect, Dispatch } from "react-redux";
import { Action } from "redux";
import { BooksList, BooksListProps } from "../components/BooksList";
import { CurrentLangContext } from "../contexts/lang";
import { AppState } from "../store";
import { fetchBooksList } from "../store/actions";

const mapStateToProps = (state: AppState) => {
  return {
    books: state.booksById,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBooksList: () => {
      dispatch(fetchBooksList({ page: 1, nbPerPage: 10 }));
    },
  };
};

export const BooksListContainer = connect(mapStateToProps, mapDispatchToProps)(
  BooksList
);
