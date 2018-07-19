export interface BookData {
  bookId: string;
  title: string;
  subtitle: string | null;
  nbPages: number | null;
  coverPath: string | null;
  lang: string;
  slug: string;
  genres: string[];
  author: AuthorData;
}

export interface AuthorData {
  authorId: string;
  firstName: string | null;
  lastName: string | null;
  birthYear: number | null;
  deathYear: number | null;
  slug: string;
  nbBooks: number;
}

export interface BookFullData extends BookData {
  epubSize: number;
  mobiSize: number;
  intro: string;
}

export interface BookWithGenreStats {
  book: BookFullData;
  genresStats: GenreWithStats[];
}

export interface QuickSearchData {
  type: "book" | "author";
  bookId: string | null;
  bookTitle: string | null;
  bookLang: string;
  bookSlug: string;
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
  authorSlug: string;
  authorNbBooks: number;
  highlight: number;
}

export interface GenreWithStats {
  title: string;
  nbBooks: number;
  nbBooksByLang: NbBooksByLang[];
}

export interface NbBooksByLang {
  lang: string;
  nbBooks: number;
}

export interface BooksDataWithPagination<T> {
  books: T[];
  meta: PaginationMetaData;
}

export interface PaginationMetaData {
  page: number;
  nbPerPage: number;
  totalCount: number;
  totalCountForAllLangs: number;
}
