import { Lang } from "domain/core";
import { BooksRepository, PaginationRequestData } from "../domain/queries";
import { Action } from "./index";

export enum Actions {
  SET_CURRENT_BOOKS_LANG = "SET_CURRENT_BOOKS_LANG",
  FETCH_FEATURED_BOOKS = "FETCH_FEATURED_BOOKS",
  FETCH_BOOK_WITH_GENRE_STATS = "FETCH_BOOK_WITH_GENRE_STATS",
  FETCH_BOOKS_FOR_GENRE = "FETCH_BOOKS_FOR_GENRE",
  FETCH_BOOKS_FOR_AUTHOR = "FETCH_BOOKS_FOR_AUTHOR",
  FETCH_BOOKS_FOR_LANG = "FETCH_BOOKS_FOR_LANG",
}

export function setCurrentBooksLang(lang: Lang): Action {
  return { type: Actions.SET_CURRENT_BOOKS_LANG, payload: { lang } };
}

export function fetchFeaturedBooks(booksRepository: BooksRepository, lang: Lang): Action {
  const fetchBooksPromise = booksRepository.getFeaturedBooks(lang);
  return { type: Actions.FETCH_FEATURED_BOOKS, payload: fetchBooksPromise };
}

export function fetchBookWithGenreStats(booksRepository: BooksRepository, bookId: string): Action {
  const fetchBookPromise = booksRepository.getBookById(bookId);
  return { type: Actions.FETCH_BOOK_WITH_GENRE_STATS, payload: fetchBookPromise };
}

export function fetchBooksForGenre(
  booksRepository: BooksRepository,
  genre: string,
  lang: string,
  pagination: PaginationRequestData
): Action {
  const fetchBooksPromise = booksRepository.getBooksByGenre(genre, lang, pagination);
  return { type: Actions.FETCH_BOOKS_FOR_GENRE, payload: fetchBooksPromise, meta: { genre, lang } };
}

export function fetchBooksForLang(
  booksRepository: BooksRepository,
  lang: string,
  pagination: PaginationRequestData
): Action {
  const fetchBooksPromise = booksRepository.getBooksByLang(lang, pagination);
  return {
    type: Actions.FETCH_BOOKS_FOR_LANG,
    payload: fetchBooksPromise,
    meta: { lang },
  };
}

export function fetchBooksForAuthor(
  booksRepository: BooksRepository,
  authorId: string,
  lang: string,
  pagination: PaginationRequestData
): Action {
  const fetchBooksPromise = booksRepository.getBooksByAuthor(authorId, lang, pagination);
  return {
    type: Actions.FETCH_BOOKS_FOR_AUTHOR,
    payload: fetchBooksPromise,
    meta: { authorId, lang },
  };
}
