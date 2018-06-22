import { Action } from "redux";
import {
  BooksById,
  BooksIdsByGenre,
  BookWithGenreStats,
  GenreWithStats,
  GenreWithStatsByName,
  PaginatedBooksIdsList,
} from "../domain/core";
import { PaginatedBooksList } from "../domain/queries";
import { Actions } from "./actions";

interface BooksFetchedAction extends Action {
  payload: BooksById;
}
interface BooksByGenreFetchedAction extends Action {
  payload: PaginatedBooksList;
  meta: BooksByGenreFetchedActionMeta;
}
interface BooksByAuthorFetchedAction extends Action {
  payload: BooksById;
  meta: BooksByAuthorFetchedActionMeta;
}

interface BookFetchedAction extends Action {
  payload: BookWithGenreStats;
}

interface BooksByGenreFetchedActionMeta {
  genre: string;
}

interface BooksByAuthorFetchedActionMeta {
  authorId: string;
}

export function booksById(state: BooksById = {}, action: Action): BooksById {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_FEATURED_BOOKS}_FULFILLED`:
      actionRef = action as BooksFetchedAction;
      return {
        ...state,
        ...actionRef.payload,
      };
    case `${Actions.FETCH_BOOKS_FOR_GENRE}_FULFILLED`:
      actionRef = action as BooksByGenreFetchedAction;
      return {
        ...state,
        ...actionRef.payload.books,
      };
    case `${Actions.FETCH_BOOKS_FOR_AUTHOR}_FULFILLED`:
      actionRef = action as BooksByAuthorFetchedAction;
      return {
        ...state,
        ...actionRef.payload,
      };
    case `${Actions.FETCH_BOOK_WITH_GENRE_STATS}_FULFILLED`:
      actionRef = action as BookFetchedAction;
      return {
        ...state,
        ...{ [actionRef.payload.book.id]: actionRef.payload.book },
      };
    default:
      return state;
  }
}

export function genresWithStats(
  state: GenreWithStatsByName = {},
  action: Action
): GenreWithStatsByName {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_BOOK_WITH_GENRE_STATS}_FULFILLED`:
      actionRef = action as BookFetchedAction;
      const genresByName: { [name: string]: GenreWithStats } = {};
      for (const genre of actionRef.payload.genresWithStats) {
        genresByName[genre.title] = genre;
      }
      return {
        ...state,
        ...genresByName,
      };
    default:
      return state;
  }
}

export function featuredBooksIds(state: string[] = [], action: Action): string[] {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_FEATURED_BOOKS}_FULFILLED`:
      actionRef = action as BooksFetchedAction;
      const payload = actionRef.payload;
      return Object.keys(payload);
    default:
      return state;
  }
}

export function booksIdsByGenre(
  state: PaginatedBooksIdsList = { results: {}, nbResultsTotal: 0 },
  action: Action
): PaginatedBooksIdsList {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_BOOKS_FOR_GENRE}_FULFILLED`:
      actionRef = action as BooksByGenreFetchedAction;
      const genre = actionRef.meta.genre;
      const pagination = actionRef.payload.pagination;
      const nbResultsTotal = pagination.nbResultsTotal;
      const booksIdsForThisGenre: string[] =
        state.results[genre] || new Array<string>(nbResultsTotal);
      const pageStartIndex = (pagination.page - 1) * pagination.nbPerPage;
      const fetchedBooks = Object.values(actionRef.payload.books);
      for (let i = 0; i < pagination.nbPerPage; i++) {
        if (!fetchedBooks[i]) {
          break; // this can happen when we display the last page :-)
        }
        booksIdsForThisGenre[pageStartIndex + i] = fetchedBooks[i].id;
      }
      return {
        nbResultsTotal,
        results: {
          ...state.results,
          [genre]: booksIdsForThisGenre,
        },
      };
    default:
      return state;
  }
}

export function booksIdsByAuthor(state: string[] = [], action: Action): string[] {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_BOOKS_FOR_AUTHOR}_FULFILLED`:
      actionRef = action as BooksByAuthorFetchedAction;
      return {
        ...state,
        ...{ [actionRef.meta.authorId]: Object.keys(actionRef.payload) },
      };
    default:
      return state;
  }
}

export function booksAssetsSize(state: string[] = [], action: Action): string[] {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_BOOK_WITH_GENRE_STATS}_FULFILLED`:
      actionRef = action as BookFetchedAction;
      return {
        ...state,
        ...{
          [actionRef.payload.book.id]: {
            epub: actionRef.payload.book.epubSize,
            mobi: actionRef.payload.book.mobiSize,
          },
        },
      };
    default:
      return state;
  }
}
