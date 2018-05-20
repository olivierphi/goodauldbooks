export interface BookData {
  book_id: string;
  book_title: string;
  book_subtitle: string | null;
  book_cover_path: string | null;
  book_lang: string;
  book_slug: string;
  author_id: string;
  author_first_name: string | null;
  author_last_name: string | null;
  author_birth_year: number | null;
  author_death_year: number | null;
  author_slug: string;
  genres: string[];
}

export interface BookWithGenreStats {
  book: BookData;
  genres: GenreWithStats[];
}

export interface PinnedBookData extends BookData {}

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
}

export interface GenreWithStats {
  title: string;
  nb_books: number;
  nb_books_by_lang: NbBooksByLang;
}

export interface NbBooksByLang {
  [lang: string]: number;
}
