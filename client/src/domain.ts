export interface BooksById {
  [uuid: string]: Book;
}

export interface Book {
  gutenbergId: number;
  id: Uuid;
  author: Author;
  title: BookTitle;
  genres: Genre[];
}

export type Uuid = string;

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
