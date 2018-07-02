import { Lang } from "domain/core";
import { PaginationRequestData } from "../domain/queries";
import { servicesLocator } from "../ServicesLocator";
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

export function fetchFeaturedBooks(lang: Lang): Action {
  const fetchBooksPromise = servicesLocator.booksRepository.getFeaturedBooks(lang);
  return { type: Actions.FETCH_FEATURED_BOOKS, payload: fetchBooksPromise };
}

export function fetchBookWithGenreStats(bookId: string): Action {
  const fetchBookPromise = servicesLocator.booksRepository.getBookById(bookId);
  return { type: Actions.FETCH_BOOK_WITH_GENRE_STATS, payload: fetchBookPromise };
}

export function fetchBooksForGenre(
  genre: string,
  lang: string,
  pagination: PaginationRequestData
): Action {
  const fetchBooksPromise = servicesLocator.booksRepository.getBooksByGenre(
    genre,
    lang,
    pagination
  );
  return { type: Actions.FETCH_BOOKS_FOR_GENRE, payload: fetchBooksPromise, meta: { genre, lang } };
}

export function fetchBooksForAuthor(
  authorId: string,
  lang: string,
  pagination: PaginationRequestData
): Action {
  const fetchBooksPromise = servicesLocator.booksRepository.getBooksByAuthor(
    authorId,
    lang,
    pagination
  );
  return {
    type: Actions.FETCH_BOOKS_FOR_AUTHOR,
    payload: fetchBooksPromise,
    meta: { authorId, lang },
  };
}
