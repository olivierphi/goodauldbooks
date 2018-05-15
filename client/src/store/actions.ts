import { container } from "../ServicesContainer";
import { Action } from "./index";

export enum Actions {
  FETCH_FEATURED_BOOKS = "FETCH_FEATURED_BOOKS",
  FETCH_BOOK_WITH_GENRE_STATS = "FETCH_BOOK_WITH_GENRE_STATS",
  FETCH_BOOKS_FOR_GENRE = "FETCH_BOOKS_FOR_GENRE",
}

export function fetchFeaturedBooks(): Action {
  const fetchBooksPromise = container.booksRepository.getFeaturedBooks();
  return { type: Actions.FETCH_FEATURED_BOOKS, payload: fetchBooksPromise };
}

export function fetchBookWithGenreStats(bookId: string): Action {
  const fetchBookPromise = container.booksRepository.getBookById(bookId);
  return { type: Actions.FETCH_BOOK_WITH_GENRE_STATS, payload: fetchBookPromise };
}

export function fetchBooksForGenre(genre: string): Action {
  const fetchBooksPromise = container.booksRepository.getBooksByGenre(genre);
  return { type: Actions.FETCH_BOOKS_FOR_GENRE, payload: fetchBooksPromise, meta: { genre } };
}
