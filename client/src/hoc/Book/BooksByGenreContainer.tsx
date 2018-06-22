import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, PaginatedBooksIdsList } from "../../domain/core";
import { PaginationRequestData, PaginationResponseData } from "../../domain/queries";
import { AppState } from "../../store";
import { fetchBooksForGenre } from "../../store/actions";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import { getPaginatedBooksIdsResultsFromCache } from "../../utils/pagination-utils";
import { getGenrePageUrl } from "../../utils/routing-utils";

interface BooksByGenreContainerProps {
  genre: string;
  pagination: PaginationRequestData;
}

const mapStateToProps = (state: AppState, ownProps: BooksByGenreContainerProps) => {
  return {
    allBooks: state.booksById,
    booksIdsByGenre: state.booksIdsByGenre,
    genre: ownProps.genre,
    pagination: ownProps.pagination,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBooksForGenre: (genre: string, pagination: PaginationRequestData) => {
      dispatch(fetchBooksForGenre(genre, pagination));
    },
  };
};

interface BooksListHOCProps {
  allBooks: BooksById;
  booksIdsByGenre: PaginatedBooksIdsList;
  fetchBooksForGenre: (genre: string, pagination: PaginationRequestData) => void;
}

const BooksListHOC = (props: BooksByGenreContainerProps & BooksListHOCProps) => {
  const booksIdsByGenre = getPaginatedBooksIdsResultsFromCache(
    props.booksIdsByGenre,
    props.genre,
    props.pagination
  );
  if (!booksIdsByGenre) {
    props.fetchBooksForGenre(props.genre, props.pagination);
    return <div className="loading">Loading books for this genre...</div>;
  }

  const booksToDisplay = getBooksByIdsFromState(booksIdsByGenre, props.allBooks);
  const paginationResponseData: PaginationResponseData = {
    nbResultsTotal: props.booksIdsByGenre.nbResultsTotal,
    ...props.pagination,
  };

  return (
    <BooksList
      books={booksToDisplay}
      pagination={paginationResponseData}
      baseUrlWithoutPagination={getGenrePageUrl(props.genre)}
    />
  );
};

export const BooksByGenreContainer = connect(mapStateToProps, mapDispatchToProps)(BooksListHOC);
