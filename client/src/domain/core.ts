export enum Lang {
  EN = "en",
}

export type Genre = string;

export interface Book {
  id: string;
  author: Author;
  title: string;
  subtitle: string | null;
  genres: Genre[];
}

export interface Author {
  firstName: string | null;
  lastName: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  wikipediaUrl?: string;
}

export interface BooksById {
  [id: string]: Book;
}
