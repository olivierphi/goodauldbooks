import { Action } from "redux";
import {
  BookId,
  BooksById,
  BookWithGenreStats,
  GenreWithStats,
  GenreWithStatsByName,
  Lang,
  LANG_ALL,
  PaginatedBooksIdsListByCriteria,
} from "../domain/core";
import { PaginatedBooksList, PaginationResponseData } from "../domain/queries";
import { Actions } from "./actions";

interface SetCurrentBooksLangAction extends Action {
  payload: { lang: Lang };
}
interface BooksFetchedAction extends Action {
  payload: BooksById;
}
interface BooksByGenreFetchedAction extends Action {
  payload: PaginatedBooksList;
  meta: BooksByGenreFetchedActionMeta;
}
interface BooksByAuthorFetchedAction extends Action {
  payload: PaginatedBooksList;
  meta: BooksByAuthorFetchedActionMeta;
}

interface BookFetchedAction extends Action {
  payload: BookWithGenreStats;
}

interface BooksByGenreFetchedActionMeta {
  genre: string;
  lang: Lang;
}

interface BooksByAuthorFetchedActionMeta {
  authorId: string;
  lang: Lang;
}

export function booksLang(state: Lang = LANG_ALL, action: Action): Lang {
  let actionRef;
  switch (action.type) {
    case `${Actions.SET_CURRENT_BOOKS_LANG}`:
      actionRef = action as SetCurrentBooksLangAction;
      return actionRef.payload.lang;
    default:
      return state;
  }
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
        ...actionRef.payload.books,
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
  state: PaginatedBooksIdsListByCriteria = {},
  action: Action
): PaginatedBooksIdsListByCriteria {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_BOOKS_FOR_GENRE}_FULFILLED`:
      actionRef = action as BooksByGenreFetchedAction;
      const genre = actionRef.meta.genre;
      const language = actionRef.meta.lang;
      const criteriaName: string = `${genre}-${language}`;

      return getPaginatedBooksIdsListByCriteriaFromPreviousStateAndFetchedBooks(
        state,
        criteriaName,
        actionRef.payload.books,
        actionRef.payload.pagination
      );

    default:
      return state;
  }
}

export function booksIdsByAuthor(
  state: PaginatedBooksIdsListByCriteria = {},
  action: Action
): PaginatedBooksIdsListByCriteria {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_BOOKS_FOR_AUTHOR}_FULFILLED`:
      actionRef = action as BooksByAuthorFetchedAction;
      const authorId = actionRef.meta.authorId;
      const language = actionRef.meta.lang;
      const criteriaName: string = `${authorId}-${language}`;

      return getPaginatedBooksIdsListByCriteriaFromPreviousStateAndFetchedBooks(
        state,
        criteriaName,
        actionRef.payload.books,
        actionRef.payload.pagination
      );

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

function getPaginatedBooksIdsListByCriteriaFromPreviousStateAndFetchedBooks(
  previousState: PaginatedBooksIdsListByCriteria,
  criteriaName: string,
  fetchedBooks: BooksById,
  pagination: PaginationResponseData
): PaginatedBooksIdsListByCriteria {
  const booksIdsForThisCriteria: BookId[] = previousState[criteriaName]
    ? previousState[criteriaName].results || []
    : [];
  const pageStartIndex = (pagination.page - 1) * pagination.nbPerPage;
  const fetchedBooksArray = Object.values(fetchedBooks);
  for (let i = 0; i < pagination.nbPerPage; i++) {
    if (!fetchedBooksArray[i]) {
      break; // this can happen when we display the last page :-)
    }
    booksIdsForThisCriteria[pageStartIndex + i] = fetchedBooksArray[i].id;
  }

  return {
    ...previousState,
    [criteriaName]: {
      nbResultsTotal: pagination.nbResultsTotal,
      nbResultsTotalForAllLangs: pagination.nbResultsTotalForAllLangs,
      results: booksIdsForThisCriteria,
    },
  };
}
