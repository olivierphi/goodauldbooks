export interface BookData {
  bookId: string;
  title: string;
  subtitle: string | null;
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

export interface QuickAutocompletionData {
  type: "book" | "author";
  book_id: string | null;
  book_title: string | null;
  book_lang: string;
  book_slug: string;
  author_id: string;
  author_first_name: string;
  author_last_name: string;
  author_slug: string;
  author_nb_books: number;
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
  pagination: PaginationResponseData;
}

export interface PaginationResponseData {
  page: number;
  nb_per_page: number;
  nb_results_total: number;
  nb_results_total_for_all_langs: number;
}
