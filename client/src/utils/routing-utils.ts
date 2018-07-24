import { Lang } from "domain/core";

// @see Main.tsx for the definitions of those routes

export function getBooksByLangPageUrl(currentBooksLang: Lang, pageNumber: null | number = null) {
  return `/library/${currentBooksLang}${pageNumber ? `?page=${pageNumber}` : ""}`;
}

export function getBookPageUrl(
  currentBooksLang: Lang,
  bookLang: Lang,
  authorSlug: string,
  bookSlug: string,
  bookId: string
) {
  return `/library/${currentBooksLang}/book/${bookLang}/${authorSlug}/${bookSlug}/${bookId}`;
}

export function getAuthorPageUrl(
  currentBooksLang: Lang,
  authorSlug: string,
  authorId: string,
  pageNumber: null | number = null
) {
  return `/library/${currentBooksLang}/author/${authorSlug}/${authorId}${
    pageNumber ? `?page=${pageNumber}` : ""
  }`;
}

export function getGenrePageUrl(
  currentBooksLang: Lang,
  genre: string,
  pageNumber: null | number = null
) {
  return `/library/${currentBooksLang}/genre/${genre}${pageNumber ? `?page=${pageNumber}` : ""}`;
}
