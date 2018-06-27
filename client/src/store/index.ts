import {
  BooksAssetsSizeById,
  BooksById,
  GenreWithStatsByName,
  PaginatedBooksIdsListByCriteria,
} from "../domain/core";

export interface AppState {
  lang: string;
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
