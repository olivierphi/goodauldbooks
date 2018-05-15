import { BooksById, BooksIdsByGenre, GenreWithStatsByName } from "../domain/core";

export interface AppState {
  booksById: BooksById;
  genresWithStats: GenreWithStatsByName;
  featuredBooksIds: string[];
  booksIdsByGenre: BooksIdsByGenre;
}

export interface Action {
  type: string;
  payload: any;
  meta?: any;
}
