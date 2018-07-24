import { Author, Book } from "./core";

export enum Page {
  HOMEPAGE = "homepage",
  BOOK = "book",
  AUTHOR = "author",
  GENRE = "genre",
  LANG = "lang",
}

export interface BreadcrumbData {
  currentPage: Page;
  currentBook?: Book;
  currentAuthor?: Author;
  currentGenre?: string;
}
