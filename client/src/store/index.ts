import {
  BooksAssetsSizeById,
  BooksById,
  GenreWithStatsByName,
  Lang,
  PaginatedBooksIdsListByCriteria,
} from "../domain/core";

export interface AppState {
  booksLang: Lang;
  booksById: BooksById;
  genresWithStats: GenreWithStatsByName;
  featuredBooksIds: string[];
  booksIdsByGenre: PaginatedBooksIdsListByCriteria;
  booksIdsByAuthor: PaginatedBooksIdsListByCriteria;
  booksAssetsSize: BooksAssetsSizeById;
}

export interface Action {
  type: string;
  payload: any;
  meta?: any;
}
