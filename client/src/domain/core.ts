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

export interface BookFull extends Book {
  epubSize: number;
  mobiSize: number;
}

export interface BookWithGenreStats {
  book: BookFull;
  genresWithStats: GenreWithStats[];
}

export interface Author {
  id: string;
  firstName: string | null;
  lastName: string | null;
  slug: string;
  birthYear?: number | null;
  deathYear?: number | null;
  nbBooks: number;
}

export interface BooksById {
  [bookId: string]: Book;
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

export interface PaginatedBooksIdsList {
  nbResultsTotal: number;
  results: BooksIdsByCriteria;
}

export interface BooksIdsByCriteria {
  [criteriaName: string]: string[];
}

export interface BooksIdsByGenre extends BooksIdsByCriteria {
  [genreName: string]: string[];
}

export interface BooksIdsByAuthor extends BooksIdsByCriteria {
  [authorId: string]: string[];
}

export interface BooksAssetsSizeById {
  [bookId: string]: BookAssetsSize;
}

export interface BookAssetsSize {
  epub: number;
  mobi: number;
}
