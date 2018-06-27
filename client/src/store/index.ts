import {
  BooksAssetsSizeById,
  BooksById,
  GenreWithStatsByName,
  PaginatedBooksIdsList,
} from "../domain/core";

export interface AppState {
  lang: string;
  booksById: BooksById;
  genresWithStats: GenreWithStatsByName;
  featuredBooksIds: string[];
  booksIdsByGenre: PaginatedBooksIdsList;
  booksIdsByAuthor: PaginatedBooksIdsList;
  booksAssetsSize: BooksAssetsSizeById;
}

export interface Action {
  type: string;
  payload: any;
  meta?: any;
}
