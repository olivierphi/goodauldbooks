export enum Lang {
  EN = "en",
}

export type Genre = string;

export interface Book {
  id: string;
  lang: string;
  author: Author;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  slug: string;
  genres: Genre[];
}

export interface BookWithGenreStats {
  book: Book;
  genresWithStats: GenreWithStats[];
}

export interface Author {
  id: string;
  firstName: string | null;
  lastName: string | null;
  slug: string;
  birthYear?: number | null;
  deathYear?: number | null;
}

export interface BooksById {
  [id: string]: Book;
}

export interface GenreWithStats {
  title: string;
  nbBooks: number;
  nbBooksByLang: NbBooksByLang;
}

export interface GenreWithStatsByName {
  [name: string]: GenreWithStats;
}

export interface NbBooksByLang {
  [lang: string]: number;
}

export interface BooksIdsByGenre {
  [genreName: string]: string[];
}
