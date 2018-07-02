import { Lang } from "domain/core";
import { PaginationRequestData } from "../domain/queries";
import { container } from "../ServicesContainer";
import { Action } from "./index";

export enum Actions {
  SET_CURRENT_BOOKS_LANG = "SET_CURRENT_BOOKS_LANG",
  FETCH_FEATURED_BOOKS = "FETCH_FEATURED_BOOKS",
  FETCH_BOOK_WITH_GENRE_STATS = "FETCH_BOOK_WITH_GENRE_STATS",
  FETCH_BOOKS_FOR_GENRE = "FETCH_BOOKS_FOR_GENRE",
  FETCH_BOOKS_FOR_AUTHOR = "FETCH_BOOKS_FOR_AUTHOR",
}

export function setCurrentBooksLang(lang: Lang): Action {
  return { type: Actions.SET_CURRENT_BOOKS_LANG, payload: { lang } };
}

export function fetchFeaturedBooks(): Action {
  const fetchBooksPromise = container.booksRepository.getFeaturedBooks();
  return { type: Actions.FETCH_FEATURED_BOOKS, payload: fetchBooksPromise };
}

export function fetchBookWithGenreStats(bookId: string): Action {
  const fetchBookPromise = container.booksRepository.getBookById(bookId);
  return { type: Actions.FETCH_BOOK_WITH_GENRE_STATS, payload: fetchBookPromise };
}

export function fetchBooksForGenre(
  genre: string,
  lang: string,
  pagination: PaginationRequestData
): Action {
  const fetchBooksPromise = container.booksRepository.getBooksByGenre(genre, lang, pagination);
  return { type: Actions.FETCH_BOOKS_FOR_GENRE, payload: fetchBooksPromise, meta: { genre, lang } };
}

export function fetchBooksForAuthor(
  authorId: string,
  lang: string,
  pagination: PaginationRequestData
): Action {
  const fetchBooksPromise = container.booksRepository.getBooksByAuthor(authorId, lang, pagination);
  return {
    type: Actions.FETCH_BOOKS_FOR_AUTHOR,
    payload: fetchBooksPromise,
    meta: { authorId, lang },
  };
}
