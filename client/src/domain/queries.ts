import { Author, Book, BooksById } from "./core";

export interface BooksRepository {
  getFeaturedBooks(): Promise<BooksById>;
  getBookById(bookId: string): Promise<Book | null>;
  quickSearch(pattern: string): Promise<Array<Book | Author>>;
}

export interface PaginationRequestData {
  page: number;
  nbPerPage: number;
}

export interface PaginationResponseData {
  currentPage: number;
  nbPerPage: number;
  nbPages: number;
  nbResults: number;
}
