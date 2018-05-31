// @see Main.tsx for the definitions of those routes

export function getBookPageUrl(
  bookLang: string,
  authorSlug: string,
  bookSlug: string,
  bookId: string
) {
  return `/library/book/${bookLang}/${authorSlug}/${bookSlug}/${bookId}`;
}

export function getAuthorPageUrl(authorSlug: string, authorId: string) {
  return `/library/author/${authorSlug}/${authorId}`;
}

export function getGenrePageUrl(genre: string) {
  return `/library/genre/${genre}`;
}
