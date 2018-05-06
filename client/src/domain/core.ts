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
  cover: string | null;
}

export interface Author {
  firstName: string | null;
  lastName: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
}

export interface BooksById {
  [id: string]: Book;
}
