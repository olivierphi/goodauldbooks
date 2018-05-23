import {
  BooksAssetsSizeById,
  BooksById,
  BooksIdsByGenre,
  GenreWithStatsByName,
} from "../domain/core";

export interface AppState {
  booksById: BooksById;
  genresWithStats: GenreWithStatsByName;
  featuredBooksIds: string[];
  booksIdsByGenre: BooksIdsByGenre;
  booksAssetsSize: BooksAssetsSizeById;
}

export interface Action {
  type: string;
  payload: any;
  meta?: any;
}
