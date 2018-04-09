export enum Lang {
  EN = "en",
}

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
  wikipediaUrl?: string;
}

export interface BookTitle extends LocalisedContent {}

export interface Genre {
  name: LocalisedContent;
}

export interface LocalisedContent {
  [lang: string]: string;
}

export interface BooksById {
  [id: string]: Book;
}
