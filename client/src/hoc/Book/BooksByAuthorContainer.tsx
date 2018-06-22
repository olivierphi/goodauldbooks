import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, PaginatedBooksIdsList } from "../../domain/core";
import { PaginationRequestData, PaginationResponseData } from "../../domain/queries";
import { AppState } from "../../store";
import { fetchBooksForAuthor } from "../../store/actions";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import { getPaginatedBooksIdsResultsFromCache } from "../../utils/pagination-utils";
import { getAuthorPageUrl } from "../../utils/routing-utils";

interface BooksByAuthorContainerProps {
  authorId: string;
  pagination: PaginationRequestData;
}

const mapStateToProps = (state: AppState, ownProps: BooksByAuthorContainerProps) => {
  return {
    allBooks: state.booksById,
    booksIdsByAuthor: state.booksIdsByAuthor,
    authorId: ownProps.authorId,
    pagination: ownProps.pagination,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBooksForAuthor: (authorId: string, pagination: PaginationRequestData) => {
      dispatch(fetchBooksForAuthor(authorId, pagination));
    },
  };
};

interface BooksListHOCProps {
  authorId: string;
  allBooks: BooksById;
  booksIdsByAuthor: PaginatedBooksIdsList;
  fetchBooksForAuthor: (authorId: string, pagination: PaginationRequestData) => void;
}

const BooksListHOC = (props: BooksByAuthorContainerProps & BooksListHOCProps) => {
  const booksIdsByAuthor = getPaginatedBooksIdsResultsFromCache(
    props.booksIdsByAuthor,
    props.authorId,
    props.pagination
  );
  if (!booksIdsByAuthor) {
    props.fetchBooksForAuthor(props.authorId, props.pagination);
    return <div className="loading">Loading books for this author...</div>;
  }

  const booksToDisplay = getBooksByIdsFromState(booksIdsByAuthor, props.allBooks);
  const paginationResponseData: PaginationResponseData = {
    nbResultsTotal: props.booksIdsByAuthor.nbResultsTotal,
    ...props.pagination,
  };

  const authorSlug = Object.values(props.allBooks)[0].author.slug;

  return (
    <BooksList
      books={booksToDisplay}
      pagination={paginationResponseData}
      baseUrlWithoutPagination={getAuthorPageUrl(authorSlug, props.authorId)}
    />
  );
};

export const BooksByAuthorContainer = connect(mapStateToProps, mapDispatchToProps)(BooksListHOC);
