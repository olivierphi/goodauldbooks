import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { Action } from "redux";
import { BooksList } from "../../components/Book/BooksList";
import { BooksById, BooksIdsByAuthor } from "../../domain/core";
import { AppState } from "../../store";
import { fetchBooksForAuthor } from "../../store/actions";
import { getBooksByIdsFromState } from "../../utils/app-state-utils";
import { getAuthorPageUrl } from "../../utils/routing-utils";

const mapStateToProps = (state: AppState) => {
  return {
    allBooks: state.booksById,
    booksIdsByAuthor: state.booksIdsByAuthor,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    fetchBooksForAuthor: (genre: string) => {
      dispatch(fetchBooksForAuthor(genre));
    },
  };
};

interface BooksListHOCProps {
  authorId: string;
  allBooks: BooksById;
  booksIdsByAuthor: BooksIdsByAuthor;
  fetchBooksForAuthor: (genre: string) => void;
}

const BooksListHOC = (props: BooksListHOCProps) => {
  if (!props.booksIdsByAuthor[props.authorId]) {
    props.fetchBooksForAuthor(props.authorId);
    return <div className="loading">Loading books for this author...</div>;
  }

  const booksToDisplay = getBooksByIdsFromState(
    props.booksIdsByAuthor[props.authorId],
    props.allBooks
  );

  const authorSlug = props.allBooks[0].author.slug;
  return (
    <BooksList
      books={booksToDisplay}
      baseUrlWithoutPagination={getAuthorPageUrl(authorSlug, props.authorId)}
    />
  );
};

export const BooksByAuthorContainer = connect(mapStateToProps, mapDispatchToProps)(BooksListHOC);
