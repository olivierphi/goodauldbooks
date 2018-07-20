export type Lang = string;
export type Genre = string;
export type BookId = string;

export const LANG_ALL = "all";

export interface Book {
  id: BookId;
  lang: Lang;
  author: Author;
  title: string;
  subtitle: string | null;
  nbPages: number | null;
  coverUrl: string | null;
  slug: string;
  genres: Genre[];
  hasIntro: boolean;
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
  totalCount: number;
  totalCountForAllLangs: number;
  results: BookId[];
}

export interface PaginatedBooksIdsListByCriteria {
  [criteriaName: string]: PaginatedBooksIdsList;
}

export interface BooksAssetsSizeById {
  [bookId: string]: BookAssetsSize;
}

export interface BookAssetsSize {
  epub: number;
  mobi: number;
}

export type BookIntro = string | null;
