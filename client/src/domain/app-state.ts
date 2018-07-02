import { Lang } from "./core";

/**
 * This class allows us to displatch domain actions with a proper Interface.
 * Such actions can be connected to Redux actions or to MessageBus message emitting.
 */
export interface ActionsDispatcher {
  setBooksLang(lang: Lang): void;
  fetchBookWithGenreStats(bookId: string): void;
}
