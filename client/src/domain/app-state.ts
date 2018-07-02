import { Lang } from "./core";
import { PaginationRequestData } from "./queries";

/**
 * This class allows us to displatch domain actions with a proper Interface.
 * Such actions can be connected to Redux actions or to MessageBus message emitting.
 */
export interface ActionsDispatcher {
  setBooksLang(lang: Lang): void;
  fetchFeaturedBooksList(lang: Lang): void;
  fetchBookWithGenreStats(bookId: string): void;
  fetchBooksForAuthor(authorId: string, lang: Lang, pagination: PaginationRequestData): void;
  fetchBooksForGenre(genre: string, lang: Lang, pagination: PaginationRequestData): void;
}
