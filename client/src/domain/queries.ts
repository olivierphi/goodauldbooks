import { Book, BooksById } from "./core";

export interface BooksRepository {
  getPinnedBooks(pagination: PaginationRequestData): Promise<BooksById>;
  getBookById(bookId: string): Promise<Book | null>;
  quickSearch(pattern: string): Promise<Book[]>;
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
