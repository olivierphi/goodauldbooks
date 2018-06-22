// @see Main.tsx for the definitions of those routes

export function getBookPageUrl(
  bookLang: string,
  authorSlug: string,
  bookSlug: string,
  bookId: string
) {
  return `/library/book/${bookLang}/${authorSlug}/${bookSlug}/${bookId}`;
}

export function getAuthorPageUrl(
  authorSlug: string,
  authorId: string,
  pageNumber: null | number = null
) {
  return `/library/author/${authorSlug}/${authorId}${pageNumber ? `&page=${pageNumber}` : ""}`;
}

export function getGenrePageUrl(genre: string, pageNumber: null | number = null) {
  return `/library/genre/${genre}${pageNumber ? `&page=${pageNumber}` : ""}`;
}
