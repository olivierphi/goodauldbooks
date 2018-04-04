export type BooksById = Map<string, Book>;

export interface Book {
  gutenbergId: number;
  id: string;
  author: Author;
  title: BookTitle;
  genres: Genre[];
}

export interface Author {
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear: number | null;
}

export interface BookTitle extends TranslatedContent {}

export interface Genre {
  name: TranslatedContent;
}

export interface TranslatedContent {
  [lang: string]: string;
}
