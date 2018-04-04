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
}

export interface BookTitle extends LocalisedContent {}

export interface Genre {
  name: LocalisedContent;
}

export type LocalisedContent = Map<Lang, string>;

export type BooksById = Map<string, Book>;
