import { Action } from "redux";
import {
  BooksById,
  BookWithGenreStats,
  GenreWithStats,
  GenreWithStatsByName,
} from "../domain/core";
import { Actions } from "./actions";

interface BooksFetchedAction extends Action {
  payload: BooksById;
}
interface BooksByGenreFetchedAction extends Action {
  payload: BooksById;
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
        ...actionRef.payload,
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

export function booksIdsByGenre(state: string[] = [], action: Action): string[] {
  let actionRef;
  switch (action.type) {
    case `${Actions.FETCH_BOOKS_FOR_GENRE}_FULFILLED`:
      actionRef = action as BooksByGenreFetchedAction;
      return {
        ...state,
        ...{ [actionRef.meta.genre]: Object.keys(actionRef.payload) },
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
