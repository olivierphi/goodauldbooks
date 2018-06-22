import {
  BooksAssetsSizeById,
  BooksById,
  BooksIdsByAuthor,
  GenreWithStatsByName,
  PaginatedBooksIdsList,
} from "../domain/core";

export interface AppState {
  booksById: BooksById;
  genresWithStats: GenreWithStatsByName;
  featuredBooksIds: string[];
  booksIdsByGenre: PaginatedBooksIdsList;
  booksIdsByAuthor: BooksIdsByAuthor;
  booksAssetsSize: BooksAssetsSizeById;
}

export interface Action {
  type: string;
  payload: any;
  meta?: any;
}
